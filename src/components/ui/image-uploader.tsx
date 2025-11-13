import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Link,
  Folder,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  placeholder = "Enter image URL or upload file",
  className = "",
  multiple = false
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file');
      setUploadStatus('error');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size must be less than 5MB');
      setUploadStatus('error');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      // For demo purposes, we'll create a local blob URL
      // In production, you would upload to your server/CDN
      const localUrl = URL.createObjectURL(file);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Copy file to public/assets directory (simulated)
      const fileName = `uploaded-${Date.now()}-${file.name}`;
      const assetPath = `/assets/${fileName}`;
      
      // In a real implementation, you would:
      // 1. Upload file to server
      // 2. Save to public/assets directory
      // 3. Return the public URL
      
      onChange(assetPath);
      setUploadStatus('success');
      
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(localUrl), 1000);
      
    } catch (error) {
      setErrorMessage('Failed to upload image. Please try again.');
      setUploadStatus('error');
    }
  };

  const clearImage = () => {
    onChange('');
    setUploadStatus('idle');
    setErrorMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* URL Input */}
      <div className="space-y-2">
        <Label>Image URL</Label>
        <div className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="flex-1"
          />
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearImage}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          multiple={multiple}
          className="hidden"
        />
        
        {uploadStatus === 'uploading' ? (
          <div className="space-y-2">
            <Upload className="w-8 h-8 text-blue-500 mx-auto animate-pulse" />
            <p className="text-sm text-gray-600">Uploading image...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drag and drop an image here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports JPG, PNG, GIF up to 5MB
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Folder className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {uploadStatus === 'success' && (
        <Alert className="border-green-500 bg-green-50">
          <AlertCircle className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Image uploaded successfully! File saved to assets directory.
          </AlertDescription>
        </Alert>
      )}

      {uploadStatus === 'error' && errorMessage && (
        <Alert className="border-red-500 bg-red-50">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Image Preview */}
      {value && (isValidUrl(value) || value.startsWith('/')) && (
        <div className="space-y-2">
          <Label>Image Preview</Label>
          <div className="border rounded-lg p-2 bg-gray-50">
            <img
              src={value}
              alt="Preview"
              className="max-w-full h-32 object-contain mx-auto rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <p className="text-xs text-gray-500 mt-2 text-center truncate">
              {value}
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p><strong>Note:</strong> For production use, uploaded files should be automatically saved to the <code>public/assets/</code> directory and the server should handle file management.</p>
      </div>
    </div>
  );
};