"use client";

import { useState } from "react";
import {
  Upload,
  FileAudio,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailedError, setDetailedError] = useState<any>(null);
  const [summaryOptions, setSummaryOptions] = useState<string[]>([]);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [isNotionConnected, setIsNotionConnected] = useState(false);

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
      formData.append("summaryOptions", JSON.stringify(summaryOptions));
      formData.append("isNotionConnected", String(isNotionConnected));

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Full server response:", result);

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

  const handleDownload = () => {
    if (!summary) return;

    const blob = new Blob([summary], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSummary = () => {
    setIsSummaryExpanded(!isSummaryExpanded);
  };

  const handleNotionConnect = async () => {
    // This is a placeholder for the actual Notion connection logic
    // You would typically redirect to Notion's OAuth flow here
    try {
      // Simulating an API call to connect to Notion
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsNotionConnected(true);
    } catch (error) {
      console.error("Error connecting to Notion:", error);
      setError("Failed to connect to Notion");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Audio to Notion 🔊 → 📝
          </h1>
        </div>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Connect to Notion
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  onClick={handleNotionConnect}
                  disabled={isNotionConnected}
                  className="w-full"
                >
                  <Link className="mr-2 h-4 w-4" />
                  {isNotionConnected
                    ? "Connected to Notion"
                    : "Connect to Notion"}
                </Button>
              </div>
              {isNotionConnected && (
                <p className="text-sm text-green-600">
                  Your Notion account is connected. Summaries will be sent to
                  your Notion.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="audio-upload"
                className="block text-sm font-medium text-gray-700"
              >
                Upload Audio File (MP3, WAV, etc.)
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  id="audio-upload"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Summary Options
              </label>
              <ToggleGroup
                type="multiple"
                value={summaryOptions}
                onValueChange={setSummaryOptions}
                className="justify-start flex-wrap"
              >
                <ToggleGroupItem
                  value="summary"
                  aria-label="Toggle summary"
                  className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
                >
                  Summary
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="main-points"
                  aria-label="Toggle main points"
                  className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
                >
                  Main Points
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="action-items"
                  aria-label="Toggle action items"
                  className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
                >
                  Action Items
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="follow-up-questions"
                  aria-label="Toggle follow-up questions"
                  className="data-[state=on]:bg-blue-500 data-[state=on]:text-white"
                >
                  Follow-up Questions
                </ToggleGroupItem>
              </ToggleGroup>
              <p className="text-sm text-gray-500">
                Select the options you would like to include in your summary.
                You can select multiple options.
              </p>
              <p className="text-sm text-gray-500">
                You can also de-select all options, which will cause the summary
                step to only run once in order to generate a title for your
                note.
              </p>
            </div>

            <Button
              type="submit"
              disabled={!selectedFile || isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Submit
                </>
              )}
            </Button>

            {selectedFile && (
              <Alert>
                <FileAudio className="h-4 w-4" />
                <AlertTitle>Selected file</AlertTitle>
                <AlertDescription>{selectedFile.name}</AlertDescription>
              </Alert>
            )}
            {isLoading && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertTitle>Processing</AlertTitle>
                <AlertDescription>
                  Please wait while we analyze your audio...
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                {detailedError && (
                  <pre className="mt-2 p-2 bg-red-100 rounded overflow-x-auto text-xs">
                    {JSON.stringify(detailedError, null, 2)}
                  </pre>
                )}
              </Alert>
            )}
          </form>
        </div>

        {summary && (
          <div className="mt-8 bg-white shadow-md rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Summary</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSummary}
                className="text-gray-500 hover:text-gray-700"
              >
                {isSummaryExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            {isSummaryExpanded && (
              <div className="bg-gray-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-gray-700">
                  {summary}
                </pre>
              </div>
            )}
            <Button className="w-full" onClick={handleDownload}>
              <FileText className="mr-2 h-4 w-4" />
              Download Markdown Summary
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
