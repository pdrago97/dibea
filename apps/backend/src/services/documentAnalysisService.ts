import { createWorker } from "tesseract.js";
import sharp from "sharp";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import OpenAI from "openai";
import { logger } from "../utils/logger";

export interface DocumentAnalysisResult {
  extractedText: string;
  entities: {
    medications: string[];
    procedures: string[];
    costs: number[];
    dates: Date[];
    locations: string[];
    symptoms: string[];
    diagnoses: string[];
    veterinarians: string[];
  };
  metadata: {
    confidence: number;
    language: string;
    documentType: string;
    processingTime: number;
  };
  insights: {
    summary: string;
    keyFindings: string[];
    recommendations: string[];
    urgencyLevel: "low" | "medium" | "high";
  };
}

export interface ImageAnalysisResult {
  description: string;
  objects: Array<{
    name: string;
    confidence: number;
    boundingBox?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  conditions: Array<{
    condition: string;
    confidence: number;
    severity: "mild" | "moderate" | "severe";
  }>;
  metadata: {
    imageQuality: number;
    resolution: string;
    colorProfile: string;
  };
}

class DocumentAnalysisService {
  private openai: OpenAI;
  private tesseractWorker: any;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    // Only initialize OpenAI client if API key is provided and not a placeholder
    if (apiKey && !apiKey.includes("placeholder")) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } else {
      logger.warn(
        "OpenAI API key not provided or is placeholder - AI features will be disabled",
      );
    }
  }

  async initialize(): Promise<void> {
    try {
      this.tesseractWorker = await createWorker("por");
      logger.info("✅ Document Analysis Service initialized");
    } catch (error) {
      logger.error("❌ Failed to initialize Document Analysis Service:", error);
      throw error;
    }
  }

  async terminate(): Promise<void> {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
    }
  }

  // Extract text from images using OCR
  async extractTextFromImage(imageBuffer: Buffer): Promise<string> {
    try {
      // Optimize image for OCR
      const optimizedImage = await sharp(imageBuffer)
        .resize(2000, 2000, { fit: "inside", withoutEnlargement: true })
        .grayscale()
        .normalize()
        .sharpen()
        .toBuffer();

      const {
        data: { text },
      } = await this.tesseractWorker.recognize(optimizedImage);
      return text.trim();
    } catch (error) {
      logger.error("Error extracting text from image:", error);
      throw error;
    }
  }

  // Extract text from PDF
  async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
    try {
      const data = await pdf(pdfBuffer);
      return data.text;
    } catch (error) {
      logger.error("Error extracting text from PDF:", error);
      throw error;
    }
  }

  // Extract text from Word documents
  async extractTextFromWord(docBuffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: docBuffer });
      return result.value;
    } catch (error) {
      logger.error("Error extracting text from Word document:", error);
      throw error;
    }
  }

  // Analyze image for visual conditions and objects
  async analyzeImage(imageBuffer: Buffer): Promise<ImageAnalysisResult> {
    try {
      // Check if OpenAI client is initialized
      if (!this.openai) {
        throw new Error("OpenAI client not initialized - AI features disabled");
      }
      // Convert image to base64 for OpenAI Vision API
      const base64Image = imageBuffer.toString("base64");

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this veterinary image and provide:
                1. Detailed description of what you see
                2. Any visible health conditions or abnormalities
                3. Objects or body parts visible
                4. Assessment of image quality
                
                Focus on medical/veterinary aspects. Be specific about any conditions you observe.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const analysis = response.choices[0].message.content || "";

      // Parse the analysis to extract structured data
      return this.parseImageAnalysis(analysis, imageBuffer);
    } catch (error) {
      logger.error("Error analyzing image:", error);
      throw error;
    }
  }

  // Process document text with NLP
  async processDocumentText(
    text: string,
    documentType:
      | "medical_record"
      | "prescription"
      | "invoice"
      | "certificate"
      | "photo",
  ): Promise<DocumentAnalysisResult> {
    const startTime = Date.now();

    try {
      // Check if OpenAI client is initialized
      if (!this.openai) {
        throw new Error("OpenAI client not initialized - AI features disabled");
      }

      const prompt = this.buildAnalysisPrompt(text, documentType);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "You are a veterinary AI assistant specialized in analyzing veterinary documents. Extract structured information and provide insights.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      });

      const analysis = response.choices[0].message.content || "";
      const processingTime = Date.now() - startTime;

      return this.parseDocumentAnalysis(
        text,
        analysis,
        documentType,
        processingTime,
      );
    } catch (error) {
      logger.error("Error processing document text:", error);
      throw error;
    }
  }

  private buildAnalysisPrompt(text: string, documentType: string): string {
    const basePrompt = `Analyze this veterinary ${documentType} and extract the following information in JSON format:

Text to analyze:
"""
${text}
"""

Please extract:
1. medications: Array of medication names mentioned
2. procedures: Array of medical procedures mentioned
3. costs: Array of numerical costs/prices mentioned
4. dates: Array of dates mentioned (in ISO format)
5. locations: Array of locations/addresses mentioned
6. symptoms: Array of symptoms described
7. diagnoses: Array of diagnoses mentioned
8. veterinarians: Array of veterinarian names mentioned

Also provide:
- summary: Brief summary of the document
- keyFindings: Array of important findings
- recommendations: Array of recommendations or next steps
- urgencyLevel: "low", "medium", or "high" based on content
- confidence: Number between 0-1 indicating extraction confidence

Return only valid JSON.`;

    return basePrompt;
  }

  private async parseDocumentAnalysis(
    originalText: string,
    analysis: string,
    documentType: string,
    processingTime: number,
  ): Promise<DocumentAnalysisResult> {
    try {
      // Try to parse JSON from the analysis
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        extractedText: originalText,
        entities: {
          medications: parsedData.medications || [],
          procedures: parsedData.procedures || [],
          costs: parsedData.costs || [],
          dates: (parsedData.dates || []).map((d: string) => new Date(d)),
          locations: parsedData.locations || [],
          symptoms: parsedData.symptoms || [],
          diagnoses: parsedData.diagnoses || [],
          veterinarians: parsedData.veterinarians || [],
        },
        metadata: {
          confidence: parsedData.confidence || 0.5,
          language: "pt-BR",
          documentType,
          processingTime,
        },
        insights: {
          summary: parsedData.summary || "Documento veterinário processado",
          keyFindings: parsedData.keyFindings || [],
          recommendations: parsedData.recommendations || [],
          urgencyLevel: parsedData.urgencyLevel || "low",
        },
      };
    } catch (error) {
      logger.error("Error parsing document analysis:", error);

      // Return basic analysis if parsing fails
      return {
        extractedText: originalText,
        entities: {
          medications: [],
          procedures: [],
          costs: [],
          dates: [],
          locations: [],
          symptoms: [],
          diagnoses: [],
          veterinarians: [],
        },
        metadata: {
          confidence: 0.3,
          language: "pt-BR",
          documentType,
          processingTime,
        },
        insights: {
          summary: "Análise automática do documento",
          keyFindings: [],
          recommendations: [],
          urgencyLevel: "low",
        },
      };
    }
  }

  private async parseImageAnalysis(
    analysis: string,
    imageBuffer: Buffer,
  ): Promise<ImageAnalysisResult> {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();

    return {
      description: analysis,
      objects: [], // Would be populated by more sophisticated image analysis
      conditions: [], // Would be populated by medical image analysis
      metadata: {
        imageQuality: 0.8, // Placeholder - would be calculated
        resolution: `${metadata.width}x${metadata.height}`,
        colorProfile: metadata.space || "unknown",
      },
    };
  }

  // Main method to process any document
  async analyzeDocument(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<DocumentAnalysisResult> {
    let extractedText = "";
    let documentType: any = "certificate";

    try {
      // Determine document type from filename and content
      documentType = this.determineDocumentType(fileName, mimeType);

      // Extract text based on file type
      if (mimeType.startsWith("image/")) {
        extractedText = await this.extractTextFromImage(fileBuffer);
      } else if (mimeType === "application/pdf") {
        extractedText = await this.extractTextFromPDF(fileBuffer);
      } else if (mimeType.includes("word") || mimeType.includes("document")) {
        extractedText = await this.extractTextFromWord(fileBuffer);
      } else {
        throw new Error(`Unsupported file type: ${mimeType}`);
      }

      // Process the extracted text
      return await this.processDocumentText(extractedText, documentType);
    } catch (error) {
      logger.error("Error analyzing document:", error);
      throw error;
    }
  }

  private determineDocumentType(fileName: string, mimeType: string): string {
    const lowerFileName = fileName.toLowerCase();

    if (
      lowerFileName.includes("receita") ||
      lowerFileName.includes("prescription")
    ) {
      return "prescription";
    } else if (
      lowerFileName.includes("laudo") ||
      lowerFileName.includes("report")
    ) {
      return "medical_report";
    } else if (
      lowerFileName.includes("nota") ||
      lowerFileName.includes("invoice")
    ) {
      return "invoice";
    } else if (mimeType.startsWith("image/")) {
      return "photo";
    } else {
      return "certificate";
    }
  }
}

export const documentAnalysisService = new DocumentAnalysisService();
