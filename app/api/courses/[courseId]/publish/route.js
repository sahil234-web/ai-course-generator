import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { CourseList } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { verifyAuthAndOwnership } from "@/lib/api-security.js";

// PUT /api/courses/[courseId]/publish - Publish/unpublish a course
export async function PUT(req, { params }) {
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

    const body = await req.json();
    const { publish } = body;

    if (typeof publish !== "boolean") {
      return NextResponse.json(
        { error: "publish must be a boolean" },
        { status: 400 }
      );
    }

    const result = await db
      .update(CourseList)
      .set({ publish })
      .where(eq(CourseList.courseId, courseId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating publish status:", error);
    return NextResponse.json(
      { error: "Failed to update publish status" },
      { status: 500 }
    );
  }
}

