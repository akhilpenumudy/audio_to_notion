"use client";

import { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setDetailedError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) return;

    setIsLoading(true);
    setSummary(null);
    setError(null);
    setDetailedError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Full server response:", result); // Log the full response

      if (!response.ok) {
        throw new Error(result.error || "Failed to process audio");
      }

      setSummary(result.summary);
    } catch (error) {
      console.error("Error processing audio:", error);
      if (error instanceof Error) {
        setError(error.message);
        setDetailedError(error);
      } else {
        setError("An unknown error occurred");
        setDetailedError(String(error));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Audio to Notion 🔊 →📝</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="audio-upload" className="block mb-2">
            Upload Audio File (MP3, WAV, etc.)
          </label>
          <input
            type="file"
            id="audio-upload"
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={!selectedFile || isLoading}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isLoading ? "Processing..." : "Transcribe and Summarize"}
        </button>
      </form>
      {selectedFile && (
        <p className="mt-4">Selected file: {selectedFile.name}</p>
      )}
      {isLoading && <p className="mt-4">Processing audio, please wait...</p>}
      {error && (
        <div className="mt-4 text-red-500">
          <p>Error: {error}</p>
          {detailedError && (
            <pre className="mt-2 p-2 bg-red-100 rounded overflow-x-auto">
              {JSON.stringify(detailedError, null, 2)}
            </pre>
          )}
        </div>
      )}
      {summary && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Summary:</h2>
          <p>{summary}</p>
        </div>
      )}
    </main>
  );
}
