'use client';

import React, { useState } from "react";
import { Button, Input, Card, CardBody, CardHeader, Chip, Spinner } from "@heroui/react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export default function AudioUploadForm() {
  const [audioName, setAudioName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"" | "uploading" | "success" | "error">("");
  const [message, setMessage] = useState<string>("");
  const router = useRouter();
  
  const uploadAudioMutation = api.audio.uploadAudio.useMutation({
    onSuccess: () => {
      setStatus("success");
      setMessage("Upload successful!");
      router.refresh(); // Refresh to show the new audio file in the list
      setAudioName("");
      setFile(null);
    },
    onError: (error) => {
      console.error("Upload error:", error);
      setStatus("error");
      setMessage(error.message || "Upload failed.");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file type on the frontend
      if (!selectedFile.type.includes('audio/mpeg') && !selectedFile.type.includes('audio/mp3')) {
        setMessage("Please select an MP3 file.");
        setFile(null);
        return;
      }
      
      // Validate file extension
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'mp3') {
        setMessage("Please select a file with .mp3 extension.");
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setStatus(""); // Clear any previous error messages
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/mpeg;base64,")
        const base64Data = result.split(',')[1];
        resolve(base64Data ?? '');
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !audioName) {
      setStatus("error");
      setMessage("Please provide an audio name and select a file.");
      return;
    }

    setStatus("uploading");
    setMessage("Uploading...");

    try {
      const fileData = await convertFileToBase64(file);
      
      await uploadAudioMutation.mutateAsync({
        name: audioName,
        fileName: file.name,
        fileData,
        fileSize: file.size,
      });
    } catch (err) {
      // Error handling is done in the mutation's onError callback
      console.error("Upload error:", err);
    }
  };

  return (
    <Card className="max-w-xl mx-auto">
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
            isDisabled={uploadAudioMutation.isPending}
            startContent={uploadAudioMutation.isPending ? <Spinner size="sm" color="white" /> : null}
          >
            {uploadAudioMutation.isPending ? "Uploading..." : "Upload Audio"}
          </Button>

          {status && (
            <Chip
              color={
                status === "success" ? "success" :
                status === "uploading" ? "primary" :
                status === "error" ? "danger" : "default"
              }
              variant="flat"
              className="w-full justify-center"
            >
              {message}
            </Chip>
          )}
        </form>
      </CardBody>
    </Card>
  );
}
