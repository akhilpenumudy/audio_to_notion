import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    console.log('Starting POST request processing');
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const summaryOptionsString = formData.get('summaryOptions') as string;
    const summaryOptions = JSON.parse(summaryOptionsString);

    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File received:', file.name, file.type, file.size);
    console.log('Summary options:', summaryOptions);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('API key not found in environment variables');
      return NextResponse.json({ error: 'API key not found' }, { status: 500 });
    }

    // Convert File to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare the prompt based on selected options
    let prompt = "Transcribe this audio and provide a summary of its content in Markdown format. ";
    if (summaryOptions.length === 0) {
      prompt += "Only generate a title for the note.";
    } else {
      prompt += "The output should ONLY include the following sections.:\n";
      if (summaryOptions.includes('summary')) prompt += "- Summary\n";
      if (summaryOptions.includes('main-points')) prompt += "- Main Points\n";
      if (summaryOptions.includes('action-items')) prompt += "- Action Items\n";
      if (summaryOptions.includes('follow-up-questions')) prompt += "- Follow-up Questions\n";
    }

    // Generate content
    console.log('Sending request to Gemini API');
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64String,
          mimeType: file.type
        }
      }
    ]);

    console.log('Received response from Gemini API');
    const response = await result.response;
    const markdown = response.text();

    console.log('Sending response back to client');
    return NextResponse.json({ summary: markdown });
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: 'An error occurred while processing the audio',
        details: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }, { status: 500 });
    }
    return NextResponse.json({ 
      error: 'An unknown error occurred while processing the audio',
      details: String(error)
    }, { status: 500 });
  }
}