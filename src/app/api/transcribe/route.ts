import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    console.log('Starting POST request processing');
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file uploaded');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('File received:', file.name, file.type, file.size);

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('API key not found in environment variables');
      return NextResponse.json({ error: 'API key not found' }, { status: 500 });
    }

    console.log('API Key found:', apiKey.substring(0, 5) + '...');

    // Convert File to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString('base64');
    console.log('File converted to base64');

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Gemini API initialized');

    // Generate content
    console.log('Sending request to Gemini API');
    const result = await model.generateContent([
      "Transcribe this audio and provide a summary of its content.",
      {
        inlineData: {
          data: base64String,
          mimeType: file.type
        }
      }
    ]);

    console.log('Received response from Gemini API');
    const response = await result.response;
    const text = response.text();

    console.log('Sending response back to client');
    return NextResponse.json({ summary: text });
  } catch (error) {
    console.error('Detailed error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
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