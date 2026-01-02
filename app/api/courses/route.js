import { NextResponse } from "next/server";
import { db } from "@/configs/db";
import { CourseList } from "@/configs/schema";
import { desc, eq, and } from "drizzle-orm";
import { verifyAuth } from "@/lib/api-security.js";

// GET /api/courses - Get all courses (with optional filters)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const createdBy = searchParams.get("createdBy");
    const publish = searchParams.get("publish");
    const courseId = searchParams.get("courseId");

    // If filtering by createdBy, verify authentication
    if (createdBy) {
      const authResult = await verifyAuth();
      if (!authResult || authResult.email !== createdBy) {
        return NextResponse.json(
          { error: "Unauthorized: Cannot access other users' courses" },
          { status: 403 }
        );
      }
    }

    let query = db.select().from(CourseList);
    const conditions = [];

    // Apply filters
    if (courseId) {
      conditions.push(eq(CourseList.courseId, courseId));
    }
    
    if (createdBy) {
      conditions.push(eq(CourseList.createdBy, createdBy));
    }

    // If no publish filter, only show published courses for public access
    if (publish === null && !createdBy) {
      conditions.push(eq(CourseList.publish, true));
    } else if (publish !== null) {
      const isPublished = publish === "true";
      conditions.push(eq(CourseList.publish, isPublished));
    }

    // Apply all conditions
    if (conditions.length > 0) {
      if (conditions.length === 1) {
        query = query.where(conditions[0]);
      } else {
        query = query.where(and(...conditions));
      }
    }

    query = query.orderBy(desc(CourseList.id));

    const result = await query;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(req) {
  try {
    const authResult = await verifyAuth();
    if (!authResult) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      courseId,
      name,
      level,
      category,
      courseOutput,
      createdBy,
      userName,
      includeVideo,
      userProfileImage,
    } = body;

    if (!courseId || !name || !level || !category || !courseOutput || !createdBy) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Security: Ensure user can only create courses for themselves
    if (createdBy !== authResult.email) {
      return NextResponse.json(
        { error: "Forbidden: Cannot create course for another user" },
        { status: 403 }
      );
    }

    const result = await db
      .insert(CourseList)
      .values({
        courseId,
        name,
        level,
        category,
        courseOutput,
        createdBy: authResult.email, // Use authenticated user's email
        userName,
        includeVideo: includeVideo || "Yes",
        userProfileImage,
        courseBanner: "/placeholder.png",
        publish: false,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}

