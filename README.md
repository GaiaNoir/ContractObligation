# ContractObligation

A Next.js application that extracts and analyzes contract obligations using AI. Upload a PDF contract and get structured obligation data with responsible parties and deadlines.

## Features

- PDF text extraction using pdf2json
- AI-powered obligation analysis using OpenAI GPT-4
- Clean, structured display of obligations
- Responsive design with Tailwind CSS
- Error handling and loading states

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure OpenAI API:**
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
   - Copy `.env.local` and add your key:
     ```
     OPENAI_API_KEY=your_actual_api_key_here
     ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## Usage

1. Upload a PDF contract using the file input
2. Click "Extract Obligations" 
3. Wait for AI processing (may take 10-30 seconds)
4. View structured obligations with:
   - What needs to be done
   - Who is responsible (Party A/B)
   - Deadlines (if specified)

## Technical Details

- **Frontend:** Next.js 15 with React 19, Tailwind CSS
- **PDF Processing:** pdf2json for text extraction
- **AI Integration:** OpenAI GPT-4 for obligation analysis
- **API:** Next.js API routes with proper error handling

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (required)

## Error Handling

- PDF parsing errors with detailed messages
- OpenAI API failures with fallback display
- File validation and size checks
- Network error handling

The app will still show extracted text even if AI processing fails.

## API Endpoints

### POST /api/extract-pdf

Accepts a PDF file and returns extracted text plus AI-analyzed obligations.

**Response:**
```json
{
  "success": true,
  "text": "Extracted text content...",
  "obligations": [
    {
      "obligation": "Submit monthly reports",
      "responsible_party": "Party A",
      "deadline": "Last day of each month"
    }
  ],
  "pages": 5,
  "filename": "contract.pdf",
  "aiError": null
}
```