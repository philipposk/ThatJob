'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function MaterialUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleUpload = async () => {
    setUploading(true);

    // Check if user is logged in or guest
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const isGuest = !user && localStorage.getItem('guest_mode') === 'true';

    for (const file of files) {
      try {
        if (isGuest) {
          // Handle guest mode - save to localStorage
          await handleGuestUpload(file);
        } else {
          // Handle authenticated user - use API
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', 'other');
          formData.append('title', file.name);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('Upload failed');
          }
        }

        setProgress((prev) => ({ ...prev, [file.name]: 100 }));
      } catch (error) {
        console.error('Error uploading file:', error);
        setProgress((prev) => ({ ...prev, [file.name]: -1 }));
      }
    }

    setUploading(false);
    setFiles([]);
    setProgress({});
  };

  const handleGuestUpload = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Extract text content for text files
      if (file.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            saveGuestMaterial(file, content);
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      } else {
        // For PDF/RTF, just store metadata
        // Content extraction would require server-side processing
        saveGuestMaterial(file, `[${file.type === 'application/pdf' ? 'PDF' : 'RTF'} file: ${file.name}]`);
        resolve();
      }
    });
  };

  const saveGuestMaterial = (file: File, content: string) => {
    const material = {
      id: `guest-material-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'other',
      title: file.name,
      content,
      file_name: file.name,
      file_type: file.type === 'application/pdf' ? 'pdf' : file.name.split('.').pop() || 'txt',
      file_size: file.size,
      created_at: new Date().toISOString(),
    };

    // Save to localStorage
    const existingMaterials = JSON.parse(
      localStorage.getItem('guest_materials') || '[]'
    );
    existingMaterials.push(material);
    localStorage.setItem('guest_materials', JSON.stringify(existingMaterials));
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Upload Materials</h1>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition"
      >
        <p className="text-gray-600 mb-4">Drag & Drop Files Here</p>
        <p className="text-sm text-gray-500 mb-4">or</p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-input"
          accept=".pdf,.rtf,.txt"
        />
        <label
          htmlFor="file-input"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
        >
          Browse Files
        </label>
        <p className="text-xs text-gray-500 mt-4">
          Supports: PDF, RTF, TXT (Max 10MB per file)
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Selected Files ({files.length})</h2>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload All'}
          </button>
        </div>
      )}
    </div>
  );
}
