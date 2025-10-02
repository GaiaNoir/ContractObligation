import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import Anthropic from '@anthropic-ai/sdk';
import mammoth from 'mammoth';

interface Obligation {
  obligation: string;
  responsible_party: string;
  deadline: string;
  affected_party?: string;
  conditions?: string;
  financial_impact?: string;
  element_type?: string;
  source_text?: string;
  risk_level?: 'High' | 'Medium' | 'Low';
  risk_explanation?: string;
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

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
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

async function extractObligations(text: string, pageBreaks?: number[]): Promise<Obligation[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  try {
    const system_prompt = "You are an expert legal contract analyzer with deep expertise across all contract types and industries. You extract every legally significant element from contracts with high accuracy and assess risk levels. You are thorough and catch all important terms, even those not explicitly listed in categories.";

    const user_prompt = `Analyze this contract and extract ALL legally significant elements with comprehensive risk assessment.

CRITICAL INSTRUCTION: Extract EVERY legally binding element in this contract, even if it doesn't fit perfectly into the categories below. If you find important legal terms not covered by these categories, use "Other Significant Term" and clearly describe what it is.

For each element found, provide:

1. **element_type**: Classify as one of these PRIMARY categories (or use "Other Significant Term" if none fit):

   CORE OBLIGATIONS & PERFORMANCE:
   - Obligation (any duty that must be performed - deliverables, services, actions required)
   - Payment Term (all financial obligations - amounts, schedules, methods, late fees, deposits, refunds, penalties, reimbursements)
   - Deadline/Timeframe (time-sensitive requirements - due dates, notice periods, response times)
   - Performance Standard/SLA (quality requirements, metrics, benchmarks, acceptance criteria, milestones)
   - Condition (requirements that must be met for something to occur - contingencies, prerequisites)
   
   RIGHTS & RESTRICTIONS:
   - Right (entitlements or permissions granted - access, usage, approval rights, audit rights)
   - Intellectual Property (ownership, licensing, usage rights, attribution, work product, patents, trademarks, copyrights)
   - Restriction/Prohibition (limits on behavior - non-compete, non-solicitation, exclusivity, usage restrictions, territory limits)
   - Confidentiality/NDA (privacy protection, data handling, trade secrets, disclosure restrictions)
   
   RISK ALLOCATION:
   - Warranty/Representation (guarantees, assurances, statements of fact about business/product/service)
   - Limitation of Liability (caps on damages, liability exclusions, consequential damage waivers)
   - Indemnification (agreements to compensate for losses, defend against claims, hold harmless)
   - Insurance Requirement (required coverage types, amounts, proof of insurance)
   
   CONTRACT LIFECYCLE:
   - Termination Provision (how contract ends - for cause, convenience, breach, notice requirements)
   - Renewal/Extension Term (how contract continues, auto-renewal, option periods)
   - Amendment/Change Procedure (how contract can be modified, change orders)
   - Survival Clause (terms continuing after contract ends)
   
   DISPUTE & COMPLIANCE:
   - Dispute Resolution (arbitration, mediation, litigation procedures, jurisdiction, venue, governing law)
   - Compliance Requirement (laws, regulations, standards, certifications to follow)
   - Force Majeure (exceptions for unforeseeable events, acts of God)
   - Material Breach/Default (what violations are serious, cure periods, remedies)
   
   STRUCTURAL TERMS:
   - Relationship Definition (independent contractor, employment, partnership status, agency)
   - Assignment/Transfer (whether contract can be transferred, subcontracting provisions)
   - Notice Requirement (how to communicate formally - method, address, timing)
   - Entire Agreement/Integration (whether this supersedes prior agreements)
   - Severability (validity if parts are invalid)
   
   SPECIALIZED PROVISIONS (common in specific industries):
   - Employee Benefits (compensation, PTO, equity, insurance, retirement - for employment contracts)
   - Real Estate Terms (property rights, easements, zoning, title, closing terms - for real estate)
   - Software/Tech Terms (licenses, SLAs, maintenance, updates, data, hosting - for technology)
   - Supply Chain Terms (specifications, quality, inspection, delivery, recalls - for manufacturing/supply)
   - Financial Terms (interest rates, collateral, covenants, prepayment - for loans/financing)
   
   OTHER SIGNIFICANT TERM:
   - Use this for ANY important legal element not covered above - describe its nature clearly

2. **description**: Clear, detailed description of what this element requires/provides/restricts. Be specific about the actual obligation or term, not just the category. Include any monetary amounts, percentages, or financial implications directly in this description.

3. **responsible_party**: Who must perform this or who this applies to. Consolidate party names intelligently (e.g., "Agency" and "Marketing Agency" = same entity). Use "Both Parties" or "Mutual" if applicable to all parties.

4. **affected_party**: Who else is impacted or benefits from this term. Use "N/A" if only one party affected, or specify other party/third parties.

5. **deadline**: Exact deadline from contract. Use specific dates ("October 15, 2025"), relative timeframes ("within 30 days of signing", "upon completion"), ongoing ("monthly", "annual"), or "Not specified". Be precise.

6. **conditions**: Any conditions that must be met for this element to apply. Examples: "upon client approval", "if revenue exceeds $1M", "in case of breach". Use "None" only if truly unconditional.

7. **source_text**: The exact sentence(s) or paragraph from the contract where this appears. Quote precisely - this must be verbatim text from the contract. This is critical for verification.

8. **risk_level**: Rate as High, Medium, or Low:
   
   **High Risk** - Terms that could cause severe harm or are significantly unfair:
   - Unlimited or uncapped liability
   - Broad, one-sided indemnification (indemnifying for other party's negligence)
   - Auto-renewal without adequate notice (less than 60 days)
   - Termination without cause or with inadequate notice
   - Severe or disproportionate penalties
   - Waiving important rights (jury trial, class action)
   - Perpetual or overly long obligations (non-competes over 2 years)
   - Extremely broad IP assignment (all inventions, even unrelated)
   - No limitation of liability or very high caps
   - Unilateral change rights without consent
   - No cure period for breach
   - Ambiguous material breach definitions
   - Extremely vague or unmeetable performance standards
   - Very short deadlines for critical obligations
   - Unusual provisions that deviate significantly from industry standards
   
   **Medium Risk** - Terms needing attention that could cause moderate issues:
   - Vague or ambiguous language requiring interpretation
   - Moderately broad scope that could be narrowed
   - Potential conflicts with other clauses
   - Reasonable penalties but worth reviewing
   - Somewhat unbalanced rights between parties
   - Conditional obligations with unclear triggers
   - Short but manageable notice periods (30-60 days)
   - Partial or capped indemnification
   - Standard but potentially burdensome compliance requirements
   - One-sided audit rights
   - Moderately broad non-compete or confidentiality
   - Payment terms with some risk (long payment periods, large retainage)
   
   **Low Risk** - Standard, reasonable, balanced terms:
   - Clear, unambiguous language
   - Fair and balanced between parties
   - Industry-standard provisions
   - Reasonable deadlines and timeframes
   - Mutual obligations with reciprocal benefits
   - Appropriate limitations and protections for both sides
   - Standard boilerplate clauses
   - Clear performance standards
   - Reasonable notice periods (60+ days)
   - Balanced indemnification
   - Capped liability at reasonable levels
   - Standard confidentiality and IP terms

9. **risk_explanation**: Explain WHY you assigned this risk level (2-4 sentences). Focus on:
    - Potential negative impact on the responsible party
    - Whether terms are one-sided or balanced
    - Fairness compared to industry standards
    - Specific concerns about ambiguity or harshness
    - What could go wrong if this term is triggered

PARTY IDENTIFICATION:
- Carefully identify ALL parties at the start of the contract
- Look for legal names, defined terms, and roles (e.g., "Client", "Contractor", "Licensor")
- Consolidate duplicates intelligently: "The Company", "Company", and "ABC Corp" are likely the same entity
- Track third parties mentioned (guarantors, beneficiaries, agents)
- Note party roles to understand context (Buyer/Seller, Employer/Employee, Franchisor/Franchisee)

EXTRACTION REQUIREMENTS - READ CAREFULLY:
1. **Be exhaustive**: Extract EVERY legally binding element, no matter how small
2. **Look beyond the obvious**: Find implied duties, conditional obligations, negative covenants
3. **Catch all financial terms**: Prices, fees, penalties, late charges, deposits, refunds, reimbursements - include amounts in description
4. **Identify all deadlines**: Due dates, notice periods, cure periods, response times, renewal dates
5. **Extract quality/performance standards**: Specifications, SLAs, acceptance criteria, metrics
6. **Note all restrictions**: What parties cannot do is just as important as what they must do
7. **Find cross-references**: Terms that reference other documents, exhibits, industry standards
8. **Include boilerplate**: Even standard clauses have legal significance (notice, severability, etc.)
9. **Flag unusual provisions**: Anything non-standard needs to be extracted and flagged
10. **Identify conflicts**: If you see contradictory terms, extract both and note the conflict
11. **Capture definitions**: Key defined terms that affect interpretation of obligations
12. **Don't invent**: Only extract what is actually in the contract. If unsure, don't include it.
13. **Verify source_text**: Every source_text must be an exact quote from the provided contract

SPECIAL ATTENTION AREAS - These are commonly missed:
- Automatic escalation clauses (price increases, expanding scope)
- Negative covenants (promises NOT to do something)
- Representations about past events or current state
- Conditions precedent (must happen before obligation arises)
- Conditions subsequent (trigger termination or changes)
- Cross-default provisions (breach in other contracts affects this one)
- Most favored customer/nation clauses
- Right of first refusal or first offer
- Subordination agreements
- Set-off rights
- Liquidated damages vs. penalties
- Survival of specific clauses post-termination
- Anti-assignment provisions
- Change of control provisions
- Key person clauses
- Minimum purchase or performance requirements

CONTEXT AWARENESS:
- Identify the contract type (employment, sales, service, license, etc.) and apply appropriate scrutiny
- Consider what's standard for this industry and contract type
- Evaluate whether terms are balanced or favor one party
- Assess whether terms seem unusual or problematic for this contract type

OUTPUT FORMAT:
Return ONLY a valid JSON array. Each element must be a complete object with all 9 fields above.
- Do NOT include any explanatory text before or after the JSON
- Do NOT truncate or summarize - include every element found
- Ensure proper JSON formatting (properly escaped quotes, valid structure)
- If the contract is long and has many elements, continue extracting ALL of them - do not stop early

Contract text:
${text}`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4096,
      temperature: 0.1,
      system: system_prompt,
      messages: [
        {
          role: "user",
          content: user_prompt
        }
      ]
    });

    const response = message.content[0];
    if (response.type !== 'text' || !response.text) {
      throw new Error('No response from Claude');
    }

    // Extract JSON from Claude's response (Claude sometimes includes explanatory text)
    let jsonText = response.text.trim();

    // Try to find JSON array in the response
    const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    } else {
      // If no array found, look for JSON object and wrap it in array
      const objMatch = jsonText.match(/\{[\s\S]*\}/);
      if (objMatch) {
        jsonText = `[${objMatch[0]}]`;
      }
    }

    let rawObligations;
    try {
      rawObligations = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parsing failed, raw response:', response.text);
      console.error('Extracted JSON text:', jsonText);
      throw new Error('Failed to parse AI response as JSON');
    }

    if (!Array.isArray(rawObligations)) {
      return [];
    }

    // Process obligations and add source traceability information
    const obligations: Obligation[] = rawObligations.map((obligation: any) => {
      const result: Obligation = {
        obligation: obligation.description || obligation.obligation || '',
        responsible_party: obligation.responsible_party || '',
        deadline: obligation.deadline || 'Not specified',
        affected_party: obligation.affected_party || undefined,
        conditions: obligation.conditions || undefined,
        financial_impact: obligation.financial_impact || undefined,
        element_type: obligation.element_type || undefined
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

      // Add risk analysis from the AI response
      if (obligation.risk_level && obligation.risk_explanation) {
        result.risk = {
          level: obligation.risk_level as 'High' | 'Medium' | 'Low',
          explanation: obligation.risk_explanation
        };
      } else {
        // Set default risk if not provided
        result.risk = {
          level: 'Low',
          explanation: 'Risk analysis not provided - defaulted to low risk'
        };
      }

      return result;
    });

    return obligations;
  } catch (error) {
    console.error('Claude API error:', error);
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
        const tempFileName = `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 11)}.pdf`;
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