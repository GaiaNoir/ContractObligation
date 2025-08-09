/**
 * Core data models for ContractObligation
 * 
 * This module defines the primary interfaces and types used throughout
 * the contract processing pipeline, from document upload to obligation extraction.
 */

/**
 * Represents an uploaded document in the system
 */
export interface Document {
    /** Unique identifier for the document */
    id: string;
    /** Original filename as uploaded by the user */
    fileName: string;
    /** File size in bytes */
    fileSize: number;
    /** MIME type of the uploaded file */
    mimeType: string;
    /** Timestamp when the document was uploaded */
    uploadedAt: Date;
    /** Current processing status of the document */
    status: ProcessingStatus;
}

/**
 * Represents an extracted obligation from a contract document
 */
export interface Obligation {
    /** Unique identifier for the obligation */
    id: string;
    /** ID of the document this obligation was extracted from */
    documentId: string;
    /** Human-readable description of the obligation */
    description: string;
    /** Party responsible for fulfilling this obligation */
    responsibleParty: PartyType;
    /** Deadline information for the obligation */
    deadline: DeadlineInfo;
    /** AI confidence score (0-1) for this extraction */
    confidence: number;
    /** Whether this obligation requires manual review */
    requiresReview: boolean;
    /** Timestamp when the obligation was extracted */
    extractedAt: Date;
}

/**
 * Deadline types for obligations
 */
export type DeadlineType =
    | 'specific_date'      // e.g., "by December 31, 2024"
    | 'relative_timeframe' // e.g., "within 30 days"
    | 'ongoing'           // e.g., "continuously maintain"
    | 'periodic'          // e.g., "monthly reports"
    | 'none';             // no specific deadline

/**
 * Frequency options for periodic obligations
 */
export type ObligationFrequency =
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'quarterly'
    | 'annually';

/**
 * Contains deadline information for an obligation
 */
export interface DeadlineInfo {
    /** Type of deadline */
    type: DeadlineType;
    /** Original text describing the deadline */
    value?: string;
    /** Parsed date if deadline is specific or calculable */
    parsedDate?: Date;
    /** Frequency for periodic obligations */
    frequency?: ObligationFrequency;
}

/**
 * Party types in a contract
 */
export type PartyType = 'Party A' | 'Party B' | 'Both';

/**
 * Maps contract parties to standardized labels
 */
export interface PartyMapping {
    /** Name or identifier for Party A */
    partyA: string;
    /** Name or identifier for Party B */
    partyB: string;
    /** Maps various party names/aliases to standardized party types */
    aliases: Record<string, PartyType>;
}

/**
 * Processing stages for document analysis
 */
export type ProcessingStage =
    | 'uploaded'     // Document uploaded successfully
    | 'parsing'      // Extracting text from document
    | 'analyzing'    // AI analysis in progress
    | 'classifying'  // Classifying and structuring obligations
    | 'complete'     // Processing finished successfully
    | 'failed';      // Processing failed with error

/**
 * Tracks the current processing status of a document
 */
export interface ProcessingStatus {
    /** Current processing stage */
    stage: ProcessingStage;
    /** Progress percentage (0-100) */
    progress: number;
    /** Optional status message */
    message?: string;
    /** Error message if processing failed */
    error?: string;
}

/**
 * Represents a document after text extraction and parsing
 */
export interface ParsedDocument {
    /** Full extracted text content */
    text: string;
    /** Document metadata and properties */
    metadata: DocumentMetadata;
    /** Optional page-by-page content breakdown */
    pages?: PageContent[];
}

/**
 * Metadata extracted from document properties
 */
export interface DocumentMetadata {
    /** Total number of pages in the document */
    pageCount: number;
    /** Document title if available */
    title?: string;
    /** Document author if available */
    author?: string;
    /** Document creation date if available */
    createdAt?: Date;
    /** Document last modified date if available */
    modifiedAt?: Date;
}

/**
 * Bounding box coordinates for text location
 */
export interface BoundingBox {
    /** X coordinate */
    x: number;
    /** Y coordinate */
    y: number;
    /** Width of the bounding box */
    width: number;
    /** Height of the bounding box */
    height: number;
}

/**
 * Content from a specific page of a document
 */
export interface PageContent {
    /** Page number (1-indexed) */
    pageNumber: number;
    /** Text content from this page */
    text: string;
    /** Optional bounding box for the page content */
    bounds?: BoundingBox;
}

/**
 * Specifies the location of text within a document
 */
export interface TextLocation {
    /** Page number where the text is located */
    page: number;
    /** Starting character index within the page */
    startIndex: number;
    /** Ending character index within the page */
    endIndex: number;
    /** Surrounding context for the located text */
    context: string;
}

/**
 * Raw obligation as initially extracted by AI, before classification
 */
export interface RawObligation {
    /** The obligation text as extracted */
    text: string;
    /** Surrounding context from the document */
    context: string;
    /** AI confidence score for this extraction (0-1) */
    confidence: number;
    /** Location of this text within the document */
    location: TextLocation;
}

/**
 * Obligation after classification and structuring
 */
export interface ClassifiedObligation {
    /** Unique identifier for the classified obligation */
    id: string;
    /** Cleaned and structured description */
    description: string;
    /** Identified responsible party */
    responsibleParty: PartyType;
    /** Parsed deadline information */
    deadline: DeadlineInfo;
    /** Overall confidence score (0-1) */
    confidence: number;
    /** Whether manual review is recommended */
    requiresReview: boolean;
}

/**
 * Result of AI analysis on a document
 */
export interface AnalysisResult {
    /** Raw obligations extracted from the document */
    obligations: RawObligation[];
    /** Identified parties and their mappings */
    parties: PartyMapping;
    /** Overall confidence in the analysis (0-1) */
    confidence: number;
    /** Time taken for analysis in milliseconds */
    processingTime: number;
}

/**
 * Upload status for documents
 */
export type UploadStatus = 'uploaded' | 'failed';

/**
 * Result of a document upload operation
 */
export interface UploadResult {
    /** Generated document ID */
    documentId: string;
    /** Original filename */
    fileName: string;
    /** File size in bytes */
    fileSize: number;
    /** Detected MIME type */
    mimeType: string;
    /** Upload status */
    status: UploadStatus;
}

/**
 * Result of validation operations
 */
export interface ValidationResult {
    /** Whether the validation passed */
    isValid: boolean;
    /** List of validation errors */
    errors: string[];
    /** List of validation warnings */
    warnings: string[];
}

/**
 * Formatted results ready for display in the UI
 */
export interface FormattedResults {
    /** Obligations formatted for display */
    obligations: DisplayObligation[];
    /** Summary statistics and insights */
    summary: ResultsSummary;
    /** Any warnings or issues to display */
    warnings: string[];
}

/**
 * Priority levels for obligations
 */
export type PriorityLevel = 'high' | 'medium' | 'low';

/**
 * Obligation enhanced with display-specific formatting
 */
export interface DisplayObligation extends ClassifiedObligation {
    /** Human-readable deadline string */
    formattedDeadline: string;
    /** Calculated priority level */
    priorityLevel: PriorityLevel;
    /** Categorization tags for filtering */
    tags: string[];
}

/**
 * Summary statistics for extracted obligations
 */
export interface ResultsSummary {
    /** Total number of obligations found */
    totalObligations: number;
    /** Count of obligations by responsible party */
    obligationsByParty: Record<PartyType, number>;
    /** Count of obligations by deadline type */
    obligationsByDeadlineType: Record<DeadlineType, number>;
    /** Average confidence score across all obligations */
    averageConfidence: number;
    /** Number of obligations flagged for review */
    requiresReviewCount: number;
}

/**
 * Supported export formats
 */
export type ExportFormat = 'pdf' | 'csv' | 'json' | 'txt';

/**
 * Data structure for exported results
 */
export interface ExportData {
    /** Export format used */
    format: ExportFormat;
    /** Exported content as string or binary data */
    content: string | Buffer;
    /** Suggested filename for the export */
    fileName: string;
    /** MIME type for the exported content */
    mimeType: string;
}