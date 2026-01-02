import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { Chapters } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { verifyAuthAndOwnership } from "@/lib/api-security.js";

// DELETE /api/chapters/[courseId] - Delete all chapters for a course
export async function DELETE(req, { params }) {
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

    const result = await db
      .delete(Chapters)
      .where(eq(Chapters.courseId, courseId))
      .returning();

    return NextResponse.json({
      message: "Chapters deleted successfully",
      count: result.length,
    });
  } catch (error) {
    console.error("Error deleting chapters:", error);
    return NextResponse.json(
      { error: "Failed to delete chapters" },
      { status: 500 }
    );
  }
}

