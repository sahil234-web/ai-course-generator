import { NextResponse } from "next/server";
import { verifyAuth } from "@/lib/api-security";
import { AI_MODELS } from "@/configs/aiModels";

/* ---------- CLEAN MARKDOWN FROM AI ---------- */
function extractJSON(text) {
  if (!text) return null;

  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

/* ---------- NORMALIZE AI OUTPUT FOR FRONTEND ---------- */
function normalizeCourseOutput(ai) {
  return {
    CourseName:
      ai.CourseName ||
      ai.courseName ||
      ai.name ||
      "",

    Description:
      ai.Description ||
      ai.description ||
      "",

    Chapters: (ai.Chapters || ai.chapters || []).map((ch, index) => ({
      ChapterName:
        ch.ChapterName ||
        ch.chapterName ||
        `Chapter ${index + 1}`,

      About:
        ch.About ||
        ch.about ||
        "",

      Duration:
        ch.Duration ||
        ch.duration ||
        "",
    })),
  };
}

export async function POST(req) {
  try {
    // Verify authentication
    const authResult = await verifyAuth();
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is not configured");
      return NextResponse.json(
        { error: "AI service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    // Call OpenRouter API
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_HOST_NAME || "http://localhost:3000",
          "X-Title": "AI Course Generator",
        },
        body: JSON.stringify({
          model: AI_MODELS.LAYOUT.model,
          temperature: AI_MODELS.LAYOUT.temperature,
          top_p: AI_MODELS.LAYOUT.top_p,
          max_tokens: AI_MODELS.LAYOUT.max_tokens,
          messages: [
            {
              role: "user",
              content:
                prompt +
                "\n\nIMPORTANT: Return ONLY raw JSON. No markdown. No ```. The JSON must include CourseName, Description, and Chapters array with ChapterName, About, and Duration fields.",
            },
          ],
        }),
      }
    );

    const data = await response.json();

    /* ---------- HANDLE OPENROUTER ERRORS ---------- */
    if (!response.ok) {
      console.error("OpenRouter API Error:", data);
      const errorMessage =
        data?.error?.message ||
        data?.error ||
        `OpenRouter API failed with status ${response.status}`;
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status >= 400 && response.status < 500 ? response.status : 500 }
      );
    }

    /* ---------- SAFE EXTRACTION ---------- */
    const rawContent =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.content;

    if (!rawContent) {
      console.error("Invalid AI response shape:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: "Invalid AI response format. No content received." },
        { status: 500 }
      );
    }

    const cleaned = extractJSON(rawContent);

    if (!cleaned) {
      console.error("Failed to extract JSON from response");
      return NextResponse.json(
        { error: "Failed to extract JSON from AI response" },
        { status: 500 }
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON Parse Failed. Raw content:", cleaned.substring(0, 500));
      console.error("Parse error:", err.message);
      return NextResponse.json(
        { 
          error: "AI returned invalid JSON. Please try again.",
          details: err.message 
        },
        { status: 500 }
      );
    }

    /* ---------- VALIDATE PARSED DATA ---------- */
    if (!parsed || typeof parsed !== "object") {
      return NextResponse.json(
        { error: "AI returned invalid data structure" },
        { status: 500 }
      );
    }

    /* ---------- NORMALIZE FOR FRONTEND ---------- */
    const normalized = normalizeCourseOutput(parsed);

    // Validate normalized output
    if (!normalized.CourseName || normalized.CourseName.trim() === "") {
      console.error("Normalized output missing CourseName:", normalized);
      return NextResponse.json(
        { error: "AI response is missing CourseName field" },
        { status: 500 }
      );
    }

    if (!normalized.Chapters || !Array.isArray(normalized.Chapters) || normalized.Chapters.length === 0) {
      console.error("Normalized output missing or empty Chapters:", normalized);
      return NextResponse.json(
        { error: "AI response is missing or has no Chapters" },
        { status: 500 }
      );
    }

    // Ensure all chapters have required fields
    const validatedChapters = normalized.Chapters.map((ch, index) => ({
      ChapterName: ch.ChapterName || `Chapter ${index + 1}`,
      About: ch.About || "",
      Duration: ch.Duration || "",
    }));

    const finalOutput = {
      CourseName: normalized.CourseName,
      Description: normalized.Description || "",
      Chapters: validatedChapters,
    };

    return NextResponse.json(finalOutput, { status: 200 });
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { 
        error: error.message || "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
