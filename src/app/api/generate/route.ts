import { NextRequest, NextResponse } from "next/server";
import { TStudioState } from "@/types/studio";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ message: "TBAC Pollinations Engine Online" });
}

export async function POST(request: NextRequest) {
  try {
    const body: TStudioState = await request.json();
    const { prompt, width, height, seed } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt text descriptor is required" }, { status: 400 });
    }

    console.log(`[LIVE ENGINE] Generating image via Pollinations.ai for: "${prompt.substring(0, 40)}..."`);

    // We use a random seed to ensure unique images for the same prompt if requested
    const imageSeed = seed || Math.floor(Math.random() * 1000000);
    const targetWidth = width || 1024;
    const targetHeight = height || 1024;

    // Pollinations.ai accepts the prompt directly in the URL path.
    // We encode the prompt to ensure special characters don't break the URL.
    const encodedPrompt = encodeURIComponent(prompt);
    
    // Construct the direct image URL. Pollinations handles the generation and returns the image binary.
    // We append the seed, width, height, and nologo parameters.
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${imageSeed}&width=${targetWidth}&height=${targetHeight}&nologo=true`;

    // We fetch the image from Pollinations to convert it to a base64 string.
    // This ensures your frontend receives the same data structure it expects.
    const response = await fetch(imageUrl);

    if (!response.ok) {
        throw new Error(`Pollinations API returned status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({
      images: [
        {
          url: dataUrl,
          width: targetWidth,
          height: targetHeight,
        }
      ]
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("[CRITICAL PIPELINE EXCEPTION]:", error);
    const fallbackMessage = error instanceof Error ? error.message : "Internal server process error.";
    return NextResponse.json({ error: fallbackMessage }, { status: 500 });
  }
}