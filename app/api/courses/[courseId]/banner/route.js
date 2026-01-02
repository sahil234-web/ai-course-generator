import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { CourseList } from "@/configs/schema";
import { eq } from "drizzle-orm";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { storage } from "@/configs/firebaseConfig";
import { verifyAuthAndOwnership } from "@/lib/api-security";

// PUT /api/courses/[courseId]/banner - Update course banner
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

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Delete previous image if it exists
    if (
      course[0]?.courseBanner &&
      course[0].courseBanner !== "/placeholder.png"
    ) {
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
        console.error("Error deleting previous banner:", error);
        // Continue with upload even if deletion fails
      }
    }

    // Upload new image
    const fileName = Date.now() + file.name;
    const storageRef = ref(storage, "ai-course/" + fileName);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await uploadBytes(storageRef, buffer);
    const imageLink = await getDownloadURL(storageRef);

    // Update course with new banner URL
    const result = await db
      .update(CourseList)
      .set({ courseBanner: imageLink })
      .where(eq(CourseList.courseId, courseId))
      .returning();

    return NextResponse.json({
      message: "Banner updated successfully",
      courseBanner: imageLink,
    });
  } catch (error) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Failed to update banner" },
      { status: 500 }
    );
  }
}

