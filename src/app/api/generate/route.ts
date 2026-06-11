import { NextRequest, NextResponse } from "next/server";
import { TStudioState } from "@/types/studio";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ message: "TBAC Studio Engine Online" });
}

export async function POST(request: NextRequest) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const body: TStudioState = await request.json();
    const { prompt, width, height } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt text descriptor is required" },
        { status: 400 }
      );
    }

    const cfToken = process.env.CF_API_TOKEN;
    const cfAccount = process.env.CF_ACCOUNT_ID;

    if (!cfToken || !cfAccount) {
      console.error("[CRITICAL]: Cloudflare credentials not configured!");
      return NextResponse.json(
        { error: "Internal server configuration error." },
        { status: 500 }
      );
    }

    const targetWidth = width || 1024;
    const targetHeight = height || 1024;

    console.log(`[LIVE ENGINE] Generating via Cloudflare AI: "${prompt.substring(0, 40)}..."`);

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${cfAccount}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          steps: 4,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error("[CF API ERROR]:", errText);
      throw new Error(`Cloudflare AI returned status: ${response.status}`);
    }

    const data = await response.json();
    const base64Image = data.result.image;
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return NextResponse.json({
      images: [{ url: dataUrl, width: targetWidth, height: targetHeight }]
    }, { status: 200 });

  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.error("[CRITICAL PIPELINE EXCEPTION]:", error);

    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json(
          { error: "Upstream generation timed out. AI servers are currently overloaded." },
          { status: 504 }
        );
      }
      if (error.message.includes("fetch failed") || error.message.includes("Connect Timeout")) {
        return NextResponse.json(
          { error: "Network connection to AI node failed. Please try again." },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Unknown internal server disruption." },
      { status: 500 }
    );
  }
}