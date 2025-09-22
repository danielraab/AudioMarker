'use client';

import React, { useState } from "react";
import { api } from "~/trpc/react";

export default function AudioUploadForm() {
  const [audioName, setAudioName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("");
  const uploadMutation = api.audio.upload.useMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !audioName) {
      setStatus("Please provide an audio name and select a file.");
      return;
    }
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const fileBase64 = reader.result as string;
        try {
          const result = await uploadMutation.mutateAsync({
            name: audioName,
            fileBase64,
            fileName: file.name,
          });
          setToken(result.token);
          setStatus("Upload successful!");
        } catch (err: any) {
          setStatus(err.message || "Upload failed.");
        }
      };
      reader.onerror = () => {
        setStatus("Failed to read file.");
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setStatus(err.message || "Upload failed.");
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
          accept="audio/mp3"
          onChange={handleFileChange}
          className="w-full"
          required
        />
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
      {status && <div className="mt-2 text-sm text-gray-700">{status}</div>}
      {token && (
        <div className="mt-2 text-sm text-gray-700">
          <span className="font-medium">Read-only Token:</span> {token}
        </div>
      )}
    </form>
  );
}
