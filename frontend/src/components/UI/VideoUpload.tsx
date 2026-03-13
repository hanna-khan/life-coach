import React, { useState } from 'react';

interface VideoUploadProps {
  onUpload: (file: File | null) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      onUpload(file); // Immediately notify parent of file selection
    } else {
      setPreviewUrl(null);
      onUpload(null);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUpload(null);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2.5 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold
          file:text-white file:cursor-pointer file:shadow-md
          file:bg-[var(--theme-accent)] hover:file:opacity-90 file:transition-opacity"
      />
      {previewUrl && (
        <div className="relative">
          <video 
            src={previewUrl} 
            controls 
            className="w-full max-h-64 rounded-lg shadow-lg" 
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <p className="text-xs text-gray-500">
        Supported formats: MP4, WebM, OGG, MOV (max 100MB)
      </p>
    </div>
  );
};

export default VideoUpload;
