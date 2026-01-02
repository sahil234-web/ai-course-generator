import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { CourseList, Chapters } from "@/configs/schema";
import { eq, and } from "drizzle-orm";
import { deleteObject, ref } from "firebase/storage";
import { storage } from "@/configs/firebaseConfig";
import {
  verifyAuth,
  verifyAuthAndOwnership,
  isCoursePublished,
} from "@/lib/api-security.js";

// GET /api/courses/[courseId] - Get a single course
export async function GET(req, { params }) {
  try {
    const { courseId } = await params;
    const { searchParams } = new URL(req.url);
    const createdBy = searchParams.get("createdBy");

    let query = db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId));

    if (createdBy) {
      // If filtering by createdBy, verify ownership
      const authResult = await verifyAuth();
      if (!authResult || authResult.email !== createdBy) {
        return NextResponse.json(
          { error: "Unauthorized: Cannot access other users' courses" },
          { status: 403 }
        );
      }
      query = query.where(
        and(
          eq(CourseList.courseId, courseId),
          eq(CourseList.createdBy, createdBy)
        )
      );
    } else {
      // Public access - only show published courses
      query = query.where(
        and(
          eq(CourseList.courseId, courseId),
          eq(CourseList.publish, true)
        )
      );
    }

    const result = await query;

    if (result.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

// PUT /api/courses/[courseId] - Update a course
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

    // Prevent changing ownership
    if (body.createdBy && body.createdBy !== course.createdBy) {
      return NextResponse.json(
        { error: "Forbidden: Cannot change course ownership" },
        { status: 403 }
      );
    }

    const result = await db
      .update(CourseList)
      .set(body)
      .where(eq(CourseList.courseId, courseId))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[courseId] - Delete a course
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

    // Delete banner image from Firebase if it exists
    if (course[0]?.courseBanner && course[0].courseBanner !== "/placeholder.png") {
      try {
        const filePath = course[0].courseBanner
          .replace(
            "https://firebasestorage.googleapis.com/v0/b/explorer-1844f.firebasestorage.app/o/",
            ""
          )
          .split("?")[0];
        const fileRef = ref(storage, decodeURIComponent(filePath));
        await deleteObject(fileRef);
      } catch (error) {
        console.error("Error deleting banner:", error);
        // Continue with course deletion even if banner deletion fails
      }
    }

    // Delete chapters
    await db.delete(Chapters).where(eq(Chapters.courseId, courseId));

    // Delete course
    const result = await db
      .delete(CourseList)
      .where(eq(CourseList.courseId, courseId))
      .returning();

    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}

