import React, { useCallback } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
}

export function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onImageUpload(file);
      }
    },
    [onImageUpload]
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="w-full max-w-xl p-8 bg-white rounded-xl shadow-lg"
    >
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="flex flex-col items-center justify-center cursor-pointer"
        >
          <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-blue-50">
            <Upload className="w-8 h-8 text-blue-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-700">Upload Image</h3>
          <p className="mb-4 text-sm text-gray-500">Drag and drop or click to select</p>
          <div className="flex items-center text-sm text-gray-400">
            <ImageIcon className="w-4 h-4 mr-2" />
            <span>Supports: JPG, PNG, WebP</span>
          </div>
        </label>
      </div>
    </div>
  );
}