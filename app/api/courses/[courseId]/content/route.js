import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { CourseList, Chapters } from "@/configs/schema";
import { eq } from "drizzle-orm";
import getVideos from "@/configs/service";
import { AI_MODELS } from "@/configs/aiModels";
import { verifyAuthAndOwnership } from "@/lib/api-security";

/* ---------- CLEAN MARKDOWN FROM AI ---------- */
function extractJSON(text) {
  if (!text) return null;
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

// POST /api/courses/[courseId]/content - Generate chapter content
export async function POST(req, { params }) {
  try {
    const { courseId } = await params;

    // Verify authentication and ownership
    const { authorized, course, user } = await verifyAuthAndOwnership(courseId);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!authorized || !course) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this course" },
        { status: 403 }
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

    // Delete previous content if exists
    const checkPreviousContent = await db
      .select()
      .from(Chapters)
      .where(eq(Chapters.courseId, courseId));

    if (checkPreviousContent.length > 0) {
      await db.delete(Chapters).where(eq(Chapters.courseId, courseId));
    }

    const chapters = course.courseOutput?.Chapters || [];
    const includeVideo = course.includeVideo;

    const generatedChapters = [];

    // Generate content for each chapter
    for (const [index, chapter] of chapters.entries()) {
      const PROMPT = `Generate detailed content for the following topic in strict JSON format:
- Topic: ${course.name}
- Chapter: ${chapter?.ChapterName}

The response must be a valid JSON object containing an array of objects with the following fields:
1. "title": A short and descriptive title for the subtopic.
2. "explanation": A detailed explanation of the subtopic.
3. "codeExample": A code example (if applicable) wrapped in <precode> tags, or an empty string if no code example is available.

Ensure:
- The JSON is valid and follows the specified format.
- The JSON is properly formatted with no syntax errors.
- The JSON contains the required fields.
- The JSON contains the correct data types.
- Proper escaping of special characters.
- No trailing commas or malformed syntax.
- The JSON is properly nested and structured.
- The response can be parsed directly using JSON.parse().

Example format:
{
  "title": "Topic Title",
  "chapters": [
    {
      "title": "Subtopic Title",
      "explanation": "Detailed explanation here.",
      "codeExample": "<precode>Code example here</precode>"
    }
  ]
}

IMPORTANT: Return ONLY raw JSON. No markdown. No \`\`\`.`;

      // Call OpenRouter API
      const aiResponse = await fetch(
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
            model: AI_MODELS.CONTENT.model,
            temperature: AI_MODELS.CONTENT.temperature,
            top_p: AI_MODELS.CONTENT.top_p,
            max_tokens: AI_MODELS.CONTENT.max_tokens,
            messages: [
              {
                role: "user",
                content: PROMPT,
              },
            ],
          }),
        }
      );

      const aiData = await aiResponse.json();

      // Handle OpenRouter API errors
      if (!aiResponse.ok) {
        console.error(`OpenRouter API Error for chapter ${index + 1}:`, aiData);
        const errorMessage =
          aiData?.error?.message ||
          aiData?.error ||
          `OpenRouter API failed with status ${aiResponse.status}`;
        return NextResponse.json(
          {
            error: `Failed to generate chapter ${index + 1} content: ${errorMessage}`,
            chapterIndex: index,
            chapterName: chapter?.ChapterName,
          },
          {
            status:
              aiResponse.status >= 400 && aiResponse.status < 500
                ? aiResponse.status
                : 500,
          }
        );
      }

      // Extract content from response
      const rawContent =
        aiData?.choices?.[0]?.message?.content ||
        aiData?.choices?.[0]?.text ||
        aiData?.content;

      if (!rawContent) {
        console.error(`Invalid AI response for chapter ${index + 1}:`, aiData);
        return NextResponse.json(
          {
            error: `Invalid AI response format for chapter ${index + 1}. No content received.`,
            chapterIndex: index,
            chapterName: chapter?.ChapterName,
          },
          { status: 500 }
        );
      }

      // Clean and parse JSON
      const cleaned = extractJSON(rawContent);

      if (!cleaned) {
        console.error(`Failed to extract JSON from chapter ${index + 1} response`);
        return NextResponse.json(
          {
            error: `Failed to extract JSON from chapter ${index + 1} response`,
            chapterIndex: index,
            chapterName: chapter?.ChapterName,
          },
          { status: 500 }
        );
      }

      let content;
      try {
        content = JSON.parse(cleaned);
      } catch (parseError) {
        console.error(
          `JSON Parse Failed for chapter ${index + 1}. Raw content:`,
          cleaned.substring(0, 500)
        );
        console.error("Parse error:", parseError.message);
        return NextResponse.json(
          {
            error: `AI returned invalid JSON for chapter ${index + 1}. Please try again.`,
            details: parseError.message,
            chapterIndex: index,
            chapterName: chapter?.ChapterName,
          },
          { status: 500 }
        );
      }

      // Validate content structure
      if (!content || typeof content !== "object") {
        return NextResponse.json(
          {
            error: `Invalid content structure for chapter ${index + 1}`,
            chapterIndex: index,
            chapterName: chapter?.ChapterName,
          },
          { status: 500 }
        );
      }

      // Generate Video URL if needed
      let videoId = null;
      if (includeVideo === "Yes") {
        try {
          const resp = await getVideos(
            course.name + ":" + chapter?.ChapterName
          );
          videoId = [
            resp[0]?.id?.videoId,
            resp[1]?.id?.videoId,
            resp[2]?.id?.videoId,
          ];
        } catch (videoError) {
          console.error(`Error fetching videos for chapter ${index}:`, videoError);
          videoId = [];
        }
      }

      // Save chapter
      await db.insert(Chapters).values({
        chapterId: String(index),
        courseId: courseId,
        content: content,
        videoId: videoId || [],
      });

      generatedChapters.push({
        chapterIndex: index,
        chapterName: chapter?.ChapterName,
        status: "success",
      });
    }

    // Update course publish status
    await db
      .update(CourseList)
      .set({ publish: true })
      .where(eq(CourseList.courseId, courseId));

    return NextResponse.json({
      message: "Course content generated successfully",
      chapters: generatedChapters,
    });
  } catch (error) {
    console.error("Error generating course content:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate course content" },
      { status: 500 }
    );
  }
}
