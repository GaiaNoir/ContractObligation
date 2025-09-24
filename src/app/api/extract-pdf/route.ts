import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import OpenAI from 'openai';
import * as mammoth from 'mammoth';

interface Obligation {
  obligation: string;
  responsible_party: string;
  deadline: string;
  contractSource?: {
    filename: string;
    pageInfo?: string;
  };
  source?: {
    text: string;
    startIndex?: number;
    endIndex?: number;
    pageNumber?: number;
    lineNumber?: number;
    matchScore?: number;
  };
  risk?: {
    level: 'High' | 'Medium' | 'Low';
    explanation: string;
  };
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromWord(buffer: Buffer): Promise<{ text: string; pageBreaks: number[] }> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    
    // Estimate page breaks for DOCX files based on content length and structure
    const pageBreaks: number[] = [0]; // Start of document
    const lines = text.split('\n');
    let currentPosition = 0;
    let currentPageLength = 0;
    const avgCharsPerPage = 3000; // Rough estimate for page length
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineLength = line.length + 1; // +1 for newline
      
      // Check for explicit page break indicators or length-based breaks
      if (line.includes('\f') || line.includes('PAGE BREAK') || 
          currentPageLength > avgCharsPerPage) {
        pageBreaks.push(currentPosition);
        currentPageLength = 0;
      }
      
      currentPosition += lineLength;
      currentPageLength += lineLength;
    }
    
    return { text, pageBreaks };
  } catch (error) {
    console.error('Word extraction error:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

// Fuzzy text matching function
function findBestMatch(needle: string, haystack: string, threshold: number = 0.6): { index: number; score: number } | null {
  if (!needle || !haystack) return null;
  
  const needleWords = needle.toLowerCase().trim().split(/\s+/);
  const haystackWords = haystack.toLowerCase().split(/\s+/);
  
  let bestMatch = { index: -1, score: 0 };
  
  // Try to find the best matching sequence
  for (let i = 0; i <= haystackWords.length - needleWords.length; i++) {
    const segment = haystackWords.slice(i, i + needleWords.length);
    let matches = 0;
    
    for (let j = 0; j < needleWords.length; j++) {
      if (segment[j] && needleWords[j] === segment[j]) {
        matches++;
      } else if (segment[j] && segment[j].includes(needleWords[j])) {
        matches += 0.5; // Partial match
      } else if (segment[j] && needleWords[j].includes(segment[j])) {
        matches += 0.5; // Partial match
      }
    }
    
    const score = matches / needleWords.length;
    if (score > bestMatch.score && score >= threshold) {
      // Calculate character position
      const wordPosition = haystackWords.slice(0, i).join(' ').length;
      bestMatch = { index: wordPosition + (i > 0 ? 1 : 0), score };
    }
  }
  
  return bestMatch.index >= 0 ? bestMatch : null;
}

function getPageFromPosition(position: number, pageBreaks: number[]): number {
  for (let i = pageBreaks.length - 1; i >= 0; i--) {
    if (position >= pageBreaks[i]) {
      return i + 1;
    }
  }
  return 1;
}

async function analyzeObligationRisk(obligation: string, responsibleParty: string, deadline: string): Promise<{ level: 'High' | 'Medium' | 'Low'; explanation: string }> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal risk analyst. Analyze contract obligations and assess their risk level. Focus only on the obligation itself - do not add new obligations or hallucinate clauses."
        },
        {
          role: "user",
          content: `Analyze this contract obligation and rate its risk level as High, Medium, or Low. Provide a brief explanation.

Obligation: "${obligation}"
Responsible Party: "${responsibleParty}"
Deadline: "${deadline}"

Consider these risk factors:
- High Risk: Potentially problematic, unfair, or heavily one-sided obligations (e.g., auto-renewal without notice, unlimited liability, termination without cause)
- Medium Risk: Obligations that may need attention or could cause issues (e.g., vague deadlines, broad scope, potential conflicts)
- Low Risk: Standard, reasonable obligations with clear terms

Return your response as JSON with fields: level (High/Medium/Low), explanation (brief reason for the risk rating).`
        }
      ],
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI for risk analysis');
    }

    const riskAnalysis = JSON.parse(response);
    
    // Validate the response structure
    if (!riskAnalysis.level || !riskAnalysis.explanation) {
      throw new Error('Invalid risk analysis response structure');
    }

    // Ensure level is one of the expected values
    const validLevels = ['High', 'Medium', 'Low'];
    if (!validLevels.includes(riskAnalysis.level)) {
      throw new Error(`Invalid risk level: ${riskAnalysis.level}`);
    }

    return {
      level: riskAnalysis.level as 'High' | 'Medium' | 'Low',
      explanation: riskAnalysis.explanation
    };
  } catch (error) {
    console.error('Risk analysis error:', error);
    // Return a default low risk assessment if analysis fails
    return {
      level: 'Low',
      explanation: 'Risk analysis unavailable - defaulted to low risk'
    };
  }
}

async function extractObligations(text: string, pageBreaks?: number[]): Promise<Obligation[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal document analyzer. Extract obligations from contracts and return them as a JSON array with source traceability."
        },
        {
          role: "user",
          content: `Extract all obligations from this contract. For each obligation, identify:
1. What needs to be done (obligation)
2. Who is responsible (responsible_party: Party A or Party B)
3. Any deadlines (deadline: use "Not specified" if none)
4. The exact sentence or paragraph from the original text where this obligation appears (source_text)

Return as a JSON array with fields: obligation, responsible_party, deadline, source_text.

Contract text:
${text}`
        }
      ],
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Try to parse the JSON response
    const rawObligations = JSON.parse(response);
    if (!Array.isArray(rawObligations)) {
      return [];
    }

    // Add source traceability information and perform risk analysis
    const obligations: Obligation[] = await Promise.all(rawObligations.map(async (obligation: any) => {
      const result: Obligation = {
        obligation: obligation.obligation || '',
        responsible_party: obligation.responsible_party || '',
        deadline: obligation.deadline || 'Not specified'
      };

      // Add source information if available
      if (obligation.source_text) {
        const sourceText = obligation.source_text.trim();
        let startIndex = text.indexOf(sourceText);
        let matchScore = 1.0;
        
        // If exact match not found, try fuzzy matching
        if (startIndex === -1) {
          const fuzzyMatch = findBestMatch(sourceText, text, 0.6);
          if (fuzzyMatch) {
            startIndex = fuzzyMatch.index;
            matchScore = fuzzyMatch.score;
          }
        }
        
        if (startIndex !== -1) {
          result.source = {
            text: sourceText,
            startIndex: startIndex,
            endIndex: startIndex + sourceText.length,
            matchScore: matchScore
          };

          // Determine page number based on document type
          if (pageBreaks && pageBreaks.length > 1) {
            // For DOCX/TXT files with estimated page breaks
            result.source.pageNumber = getPageFromPosition(startIndex, pageBreaks);
          } else {
            // For PDF files with explicit page markers
            const textBeforeSource = text.substring(0, startIndex);
            const pageMatches = textBeforeSource.match(/--- Page (\d+) ---/g);
            if (pageMatches && pageMatches.length > 0) {
              const lastPageMatch = pageMatches[pageMatches.length - 1];
              const pageNumber = parseInt(lastPageMatch.match(/\d+/)?.[0] || '1');
              result.source.pageNumber = pageNumber;
            }
          }

          // Calculate approximate line number
          const textBeforeSource = text.substring(0, startIndex);
          const linesBeforeSource = textBeforeSource.split('\n').length;
          result.source.lineNumber = linesBeforeSource;
        } else {
          // If no match found at all, still include the source text from AI
          result.source = {
            text: sourceText
          };
        }
      }

      // Perform risk analysis for each obligation
      try {
        const riskAnalysis = await analyzeObligationRisk(
          result.obligation,
          result.responsible_party,
          result.deadline
        );
        result.risk = riskAnalysis;
      } catch (error) {
        console.error('Risk analysis failed for obligation:', result.obligation, error);
        // Set default risk if analysis fails
        result.risk = {
          level: 'Low',
          explanation: 'Risk analysis failed - defaulted to low risk'
        };
      }
      return result;
    }));

    return obligations;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to extract obligations using AI');
  }
}

export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;
  
  try {
    const formData = await request.formData();
    const file = formData.get('document') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if file is supported format
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
      'text/plain' // .txt
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Please upload a PDF, Word document, or text file (.pdf, .docx, .doc, .txt)' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Processing document:', file.name, 'Type:', file.type, 'Size:', buffer.length);

    let extractedText = '';
    let pageCount = 1;
    let pageBreaks: number[] | undefined;

    try {
      if (file.type === 'application/pdf') {
        // Validate PDF format
        const pdfHeader = buffer.toString('ascii', 0, 4);
        if (pdfHeader !== '%PDF') {
          return NextResponse.json(
            { error: 'Invalid PDF file format' },
            { status: 400 }
          );
        }

        // Create a temporary file for pdf2json
        const tempFileName = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.pdf`;
        tempFilePath = join(tmpdir(), tempFileName);
        writeFileSync(tempFilePath, buffer);

        // Use pdf2json for extraction
        const PDFParser = require('pdf2json');
        
        extractedText = await new Promise<string>((resolve, reject) => {
          const pdfParser = new PDFParser();
          
          pdfParser.on('pdfParser_dataError', (errData: any) => {
            reject(new Error(errData.parserError || 'PDF parsing failed'));
          });
          
          pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
            try {
              let fullText = '';
              
              if (pdfData.Pages && Array.isArray(pdfData.Pages)) {
                pageCount = pdfData.Pages.length;
                pdfData.Pages.forEach((page: any, pageIndex: number) => {
                  fullText += `--- Page ${pageIndex + 1} ---\n`;
                  
                  if (page.Texts && Array.isArray(page.Texts)) {
                    page.Texts.forEach((textItem: any) => {
                      if (textItem.R && Array.isArray(textItem.R)) {
                        textItem.R.forEach((run: any) => {
                          if (run.T) {
                            // Decode URI component (pdf2json encodes text)
                            const decodedText = decodeURIComponent(run.T);
                            fullText += decodedText + ' ';
                          }
                        });
                      }
                    });
                  }
                  fullText += '\n\n';
                });
              }
              
              resolve(fullText.trim());
            } catch (parseError) {
              reject(parseError);
            }
          });
          
          pdfParser.loadPDF(tempFilePath);
        });

        // Clean up temp file
        if (tempFilePath) {
          try {
            unlinkSync(tempFilePath);
          } catch (cleanupError) {
            console.warn('Failed to clean up temp file:', cleanupError);
          }
          tempFilePath = null;
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                 file.type === 'application/msword') {
        // Handle Word documents (.doc, .docx)
        const wordResult = await extractTextFromWord(buffer);
        extractedText = wordResult.text;
        pageBreaks = wordResult.pageBreaks;
        pageCount = Math.max(1, pageBreaks.length - 1); // Number of page breaks indicates pages
      } else if (file.type === 'text/plain') {
        // Handle TXT files
        extractedText = buffer.toString('utf-8');
        
        // Create page breaks for TXT files based on content structure
        pageBreaks = [0]; // Start of document
        const lines = extractedText.split('\n');
        let currentPosition = 0;
        let currentPageLength = 0;
        const avgCharsPerPage = 3000; // Rough estimate for page length
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineLength = line.length + 1; // +1 for newline
          
          // Check for explicit page break indicators or length-based breaks
          if (line.includes('\f') || line.includes('PAGE BREAK') || 
              line.includes('---PAGE---') || currentPageLength > avgCharsPerPage) {
            pageBreaks.push(currentPosition);
            currentPageLength = 0;
          }
          
          currentPosition += lineLength;
          currentPageLength += lineLength;
        }
        
        pageCount = Math.max(1, pageBreaks.length - 1);
      }

      // Extract obligations using OpenAI
      let obligations: Obligation[] = [];
      let aiError: string | null = null;

      if (extractedText && extractedText.trim()) {
        try {
          obligations = await extractObligations(extractedText, pageBreaks);
        } catch (error) {
          console.error('AI extraction error:', error);
          aiError = error instanceof Error ? error.message : 'AI extraction failed';
        }
      }

      return NextResponse.json({
        success: true,
        text: extractedText || 'No readable text content found in document',
        obligations,
        aiError,
        pages: pageCount,
        filename: file.name
      });

    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to extract text from document',
        details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        filename: file.name,
        fileSize: buffer.length,
        suggestion: file.type === 'application/pdf' 
          ? 'This PDF may be password-protected, image-based, or use a complex format.'
          : 'This Word document may be corrupted or use an unsupported format.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('General API error:', error);
    return NextResponse.json(
      { 
        error: 'Server error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // Ensure temp file cleanup
    if (tempFilePath) {
      try {
        unlinkSync(tempFilePath);
      } catch (cleanupError) {
        console.warn('Failed to clean up temp file in finally block:', cleanupError);
      }
    }
  }
}