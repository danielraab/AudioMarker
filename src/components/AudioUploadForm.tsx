'use client';

import React, { useState } from "react";

export default function AudioUploadForm() {
  const [audioName, setAudioName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [readonlyToken, setReadonlyToken] = useState("");
  const [status, setStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type on the frontend
      if (!selectedFile.type.includes('audio/mpeg') && !selectedFile.type.includes('audio/mp3')) {
        setStatus("Please select an MP3 file.");
        setFile(null);
        return;
      }
      
      // Validate file extension
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'mp3') {
        setStatus("Please select a file with .mp3 extension.");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setStatus(""); // Clear any previous error messages
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !audioName) {
      setStatus("Please provide an audio name and select a file.");
      return;
    }
    
    setIsUploading(true);
    setStatus("Uploading...");
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', audioName);

      const response = await fetch('/api/audio-upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();
      setReadonlyToken(result.readonlyToken);
      setStatus("Upload successful!");

    } catch (err: any) {
      setStatus(err.message || "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded max-w-md mx-auto">
      <div>
        <label className="block mb-1 font-medium">Audio Name</label>
        <input
          type="text"
          value={audioName}
          onChange={e => setAudioName(e.target.value)}
          className="w-full border px-2 py-1 rounded"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">MP3 File</label>
        <input
          type="file"
          accept="audio/mpeg,audio/mp3,.mp3"
          onChange={handleFileChange}
          className="w-full"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isUploading}
        className={`px-4 py-2 rounded text-white font-medium ${
          isUploading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUploading ? (
          <div className="flex items-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </div>
        ) : (
          'Upload'
        )}
      </button>
      {status && (
        <div className={`mt-2 text-sm ${
          status === "Upload successful!" ? 'text-green-600' :
          status === "Uploading..." ? 'text-blue-600' :
          'text-red-600'
        }`}>
          {status}
        </div>
      )}
      {readonlyToken && (
        <div className="mt-2 text-sm text-gray-700">
          <span className="font-medium">Read-only Token:</span> {readonlyToken}
        </div>
      )}
    </form>
  );
}
