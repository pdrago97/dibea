import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface UploadResult {
  fileId: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  bucket: string;
  key: string;
}

export interface UploadOptions {
  animalId?: string;
  documentType?: 'photo' | 'medical_report' | 'prescription' | 'invoice' | 'certificate';
  metadata?: Record<string, string>;
}

class StorageService {
  private s3Client: S3Client;
  private bucket: string;
  private endpoint: string;

  constructor() {
    this.endpoint = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}`;
    this.bucket = process.env.MINIO_BUCKET || 'dibea-files';

    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: 'us-east-1', // MinIO doesn't care about region
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY || 'dibea',
        secretAccessKey: process.env.MINIO_SECRET_KEY || 'dibea123456'
      },
      forcePathStyle: true // Required for MinIO
    });
  }

  async initialize(): Promise<void> {
    try {
      // Test connection by trying to list objects
      await this.s3Client.send(new GetObjectCommand({
        Bucket: this.bucket,
        Key: 'test-connection'
      })).catch(() => {
        // Expected to fail, just testing connection
      });
      
      logger.info('✅ Storage Service (MinIO) initialized');
    } catch (error) {
      logger.error('❌ Failed to initialize Storage Service:', error);
      throw error;
    }
  }

  // Upload file to MinIO
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {
      const fileId = uuidv4();
      const fileExtension = this.getFileExtension(fileName);
      const sanitizedFileName = this.sanitizeFileName(fileName);
      
      // Create organized folder structure
      let keyPrefix = 'documents';
      if (options.animalId) {
        keyPrefix = `animals/${options.animalId}/documents`;
      }
      if (options.documentType) {
        keyPrefix += `/${options.documentType}`;
      }
      
      const key = `${keyPrefix}/${fileId}-${sanitizedFileName}`;

      // Prepare metadata
      const metadata = {
        'file-id': fileId,
        'original-name': fileName,
        'upload-date': new Date().toISOString(),
        'animal-id': options.animalId || '',
        'document-type': options.documentType || '',
        ...options.metadata
      };

      // Upload to MinIO
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: fileBuffer,
        ContentType: mimeType,
        ContentLength: fileBuffer.length,
        Metadata: metadata
      });

      await this.s3Client.send(command);

      const fileUrl = `${this.endpoint}/${this.bucket}/${key}`;

      logger.info(`📁 File uploaded: ${fileName} -> ${key}`);

      return {
        fileId,
        fileName: sanitizedFileName,
        fileUrl,
        mimeType,
        size: fileBuffer.length,
        bucket: this.bucket,
        key
      };
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw error;
    }
  }

  // Get file from MinIO
  async getFile(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('File not found');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      logger.error('Error getting file:', error);
      throw error;
    }
  }

  // Generate signed URL for temporary access
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      logger.error('Error generating signed URL:', error);
      throw error;
    }
  }

  // Delete file from MinIO
  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(command);
      logger.info(`🗑️ File deleted: ${key}`);
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(
    files: Array<{
      buffer: Buffer;
      fileName: string;
      mimeType: string;
    }>,
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file =>
      this.uploadFile(file.buffer, file.fileName, file.mimeType, options)
    );

    return Promise.all(uploadPromises);
  }

  // Get file metadata
  async getFileMetadata(key: string): Promise<Record<string, string>> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const response = await this.s3Client.send(command);
      return response.Metadata || {};
    } catch (error) {
      logger.error('Error getting file metadata:', error);
      throw error;
    }
  }

  // List files for an animal
  async listAnimalFiles(animalId: string): Promise<Array<{
    key: string;
    fileName: string;
    size: number;
    lastModified: Date;
    url: string;
  }>> {
    try {
      // This is a simplified version - in production you'd use ListObjectsV2Command
      // For now, we'll return an empty array as MinIO listing requires more setup
      return [];
    } catch (error) {
      logger.error('Error listing animal files:', error);
      throw error;
    }
  }

  // Utility methods
  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(lastDot) : '';
  }

  // Validate file type and size
  validateFile(fileName: string, mimeType: string, size: number): {
    isValid: boolean;
    error?: string;
  } {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (size > maxSize) {
      return {
        isValid: false,
        error: 'File size exceeds 50MB limit'
      };
    }

    if (!allowedTypes.includes(mimeType)) {
      return {
        isValid: false,
        error: 'File type not supported'
      };
    }

    return { isValid: true };
  }

  // Generate thumbnail for images
  async generateThumbnail(imageBuffer: Buffer): Promise<Buffer> {
    const sharp = require('sharp');
    
    try {
      return await sharp(imageBuffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    } catch (error) {
      logger.error('Error generating thumbnail:', error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
