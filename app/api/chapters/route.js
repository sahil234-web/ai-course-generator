import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { Chapters, CourseList } from "@/configs/schema";
import { eq, and } from "drizzle-orm";
import { verifyAuth, verifyCourseOwnership, isCoursePublished } from "@/lib/api-security.js";

// GET /api/chapters?courseId=xxx - Get all chapters for a course
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const chapterId = searchParams.get("chapterId");

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is required" },
        { status: 400 }
      );
    }

    // Check if course is published (public access) or user owns it
    const authResult = await verifyAuth();
    const isPublished = await isCoursePublished(courseId);
    
    if (!isPublished && authResult) {
      // If not published, check ownership
      const { authorized } = await verifyCourseOwnership(courseId, authResult.email);
      if (!authorized) {
        return NextResponse.json(
          { error: "Forbidden: Course is not published and you don't own it" },
          { status: 403 }
        );
      }
    } else if (!isPublished && !authResult) {
      // Not published and not authenticated
      return NextResponse.json(
        { error: "Forbidden: Course is not published" },
        { status: 403 }
      );
    }

    let query = db
      .select()
      .from(Chapters)
      .where(eq(Chapters.courseId, courseId));

    if (chapterId !== null) {
      query = query.where(
        and(
          eq(Chapters.courseId, courseId),
          eq(Chapters.chapterId, chapterId)
        )
      );
    }

    const result = await query;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

// POST /api/chapters - Create a new chapter
export async function POST(req) {
  try {
    const authResult = await verifyAuth();
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, chapterId, content, videoId } = body;

    if (!courseId || chapterId === undefined || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify ownership before creating chapter
    const { authorized } = await verifyCourseOwnership(courseId, authResult.email);
    if (!authorized) {
      return NextResponse.json(
        { error: "Forbidden: You don't own this course" },
        { status: 403 }
      );
    }

    const result = await db
      .insert(Chapters)
      .values({
        courseId,
        chapterId: String(chapterId),
        content,
        videoId: videoId || [],
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating chapter:", error);
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}

