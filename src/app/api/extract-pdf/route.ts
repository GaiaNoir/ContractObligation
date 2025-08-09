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
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Word extraction error:', error);
    throw new Error('Failed to extract text from Word document');
  }
}

async function extractObligations(text: string): Promise<Obligation[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a legal document analyzer. Extract obligations from contracts and return them as a JSON array."
        },
        {
          role: "user",
          content: `Extract all obligations from this contract. For each obligation, identify: what needs to be done, who is responsible (Party A or Party B), and any deadlines. Return as a JSON array with fields: obligation, responsible_party, deadline. If no deadline is specified, use "Not specified".

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
    const obligations = JSON.parse(response);
    return Array.isArray(obligations) ? obligations : [];
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
      'application/msword' // .doc
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Please upload a PDF or Word document (.pdf, .docx, .doc)' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    console.log('Processing document:', file.name, 'Type:', file.type, 'Size:', buffer.length);

    let extractedText = '';
    let pageCount = 1;

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
      } else {
        // Handle Word documents (.doc, .docx)
        extractedText = await extractTextFromWord(buffer);
        // Word documents don't have pages in the same way, so we'll estimate
        pageCount = Math.max(1, Math.ceil(extractedText.length / 3000)); // Rough estimate
      }

      // Extract obligations using OpenAI
      let obligations: Obligation[] = [];
      let aiError: string | null = null;

      if (extractedText && extractedText.trim()) {
        try {
          obligations = await extractObligations(extractedText);
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