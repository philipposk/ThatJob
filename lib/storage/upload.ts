import { createClient } from '../supabase/server';
import { logger } from '../logger';

const MAX_FILE_SIZE_PDF = parseInt(process.env.MAX_FILE_SIZE_PDF || '10485760'); // 10MB
const MAX_FILE_SIZE_OTHER = parseInt(process.env.MAX_FILE_SIZE_OTHER || '5242880'); // 5MB

export async function uploadFile(
  userId: string,
  file: File,
  bucket: 'user-materials' | 'generated-documents' | 'templates'
): Promise<string> {
  const supabase = await createClient();
  
  // Validate file size
  const maxSize = file.type === 'application/pdf' ? MAX_FILE_SIZE_PDF : MAX_FILE_SIZE_OTHER;
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
  }
  
  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  // Convert File to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });
  
  if (error) {
    logger.error('Error uploading file', { error, userId, bucket });
    throw new Error('Failed to upload file');
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);
  
  return urlData.publicUrl;
}

export async function deleteFile(
  bucket: 'user-materials' | 'generated-documents' | 'templates',
  filePath: string
): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);
  
  if (error) {
    logger.error('Error deleting file', { error, bucket, filePath });
    throw new Error('Failed to delete file');
  }
}
