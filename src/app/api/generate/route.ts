import { NextRequest, NextResponse } from "next/server";
import { TStudioState } from "@/types/studio";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ message: "TBAC Pollinations Engine Online" });
}

export async function POST(request: NextRequest) {
  // Create an AbortController with a 15-second hard limit to prevent infinite hangs
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const body: TStudioState = await request.json();
    const { prompt, width, height, seed } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt text descriptor is required" }, { status: 400 });
    }

    console.log(`[LIVE ENGINE] Generating image via Pollinations.ai for: "${prompt.substring(0, 40)}..."`);

    const imageSeed = seed || Math.floor(Math.random() * 1000000);
    const targetWidth = width || 1024;
    const targetHeight = height || 1024;
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?seed=${imageSeed}&width=${targetWidth}&height=${targetHeight}&nologo=true`;

    // Fetch with the abort signal attached
    const response = await fetch(imageUrl, { signal: controller.signal });
    clearTimeout(timeoutId); // Clear the timeout if the fetch succeeds

    if (!response.ok) {
        throw new Error(`Pollinations API returned status: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    return NextResponse.json({
      images: [{ url: dataUrl, width: targetWidth, height: targetHeight }]
    }, { status: 200 });

  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.error("[CRITICAL PIPELINE EXCEPTION]:", error);
    
    // Explicit network error handling
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json({ error: "Upstream generation timed out. AI servers are currently overloaded." }, { status: 504 });
      }
      if (error.message.includes("fetch failed") || error.message.includes("Connect Timeout")) {
         return NextResponse.json({ error: "Network connection to AI node failed. Please try again." }, { status: 503 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ error: "Unknown internal server disruption." }, { status: 500 });
  }
}