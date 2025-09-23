'use client';

import React, { useState } from "react";
import { Button, Input, Card, CardBody, CardHeader, Chip, Spinner } from "@heroui/react";

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
    <Card className="max-w-md mx-auto">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md font-semibold">New Audio Upload</p>
          <p className="text-small text-default-500">Upload your MP3 audio file</p>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="text"
            label="Audio Name"
            placeholder="Enter a name for your audio"
            value={audioName}
            onValueChange={setAudioName}
            isRequired
            variant="bordered"
            labelPlacement="outside"
          />
          
            <Input
              type="file"
              accept="audio/mpeg,audio/mp3,.mp3"
              onChange={handleFileChange}
              label="MP3 File"
              labelPlacement="outside"
              variant="bordered"
              isRequired
              description={file ? `Selected: ${file.name}` : "Choose an MP3 audio file"}
              classNames={{
                input: "file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer",
                inputWrapper: "hover:border-primary-300"
              }}
            />

          <Button
            type="submit"
            color="primary"
            size="lg"
            className="w-full"
            isDisabled={isUploading}
            startContent={isUploading ? <Spinner size="sm" color="white" /> : null}
          >
            {isUploading ? "Uploading..." : "Upload Audio"}
          </Button>

          {status && (
            <Chip
              color={
                status === "Upload successful!" ? "success" :
                status === "Uploading..." ? "primary" :
                "danger"
              }
              variant="flat"
              className="w-full justify-center"
            >
              {status}
            </Chip>
          )}

          {readonlyToken && (
            <div className="p-3 bg-default-100 rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">Read-only Token:</p>
              <code className="text-xs bg-default-200 p-2 rounded block break-all">
                {readonlyToken}
              </code>
            </div>
          )}
        </form>
      </CardBody>
    </Card>
  );
}
