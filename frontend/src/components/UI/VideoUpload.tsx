import React, { useState } from 'react';

interface VideoUploadProps {
  onUpload: (file: File) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-theme-accent file:text-white hover:file:bg-theme-accent-hover"
      />
      {previewUrl && (
        <video src={previewUrl} controls className="w-full max-h-64 rounded-lg shadow" />
      )}
      <button
        type="submit"
        disabled={!selectedFile}
        className="bg-theme-primary text-white px-6 py-2 rounded-lg font-semibold disabled:opacity-50"
      >
        Upload Video
      </button>
    </form>
  );
};

export default VideoUpload;
