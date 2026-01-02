import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/configs/db";
import { CourseList } from "@/configs/schema";
import { eq } from "drizzle-orm";

/**
 * Verify user is authenticated
 * @returns {Promise<{userId: string, email: string} | null>}
 */
export async function verifyAuth() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return null;
    }

    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress;

    return { userId, email };
  } catch (error) {
    console.error("Auth verification error:", error);
    return null;
  }
}

/**
 * Verify user owns a course
 * @param {string} courseId - Course ID to check
 * @param {string} userEmail - User's email address
 * @returns {Promise<{authorized: boolean, course: object | null}>}
 */
export async function verifyCourseOwnership(courseId, userEmail) {
  try {
    if (!courseId || !userEmail) {
      return { authorized: false, course: null };
    }

    const course = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId))
      .limit(1);

    if (course.length === 0) {
      return { authorized: false, course: null };
    }

    const isOwner = course[0].createdBy === userEmail;
    return { authorized: isOwner, course: course[0] };
  } catch (error) {
    console.error("Ownership verification error:", error);
    return { authorized: false, course: null };
  }
}

/**
 * Verify user owns a course and is authenticated
 * @param {string} courseId - Course ID to check
 * @returns {Promise<{authorized: boolean, course: object | null, user: object | null}>}
 */
export async function verifyAuthAndOwnership(courseId) {
  const authResult = await verifyAuth();
  if (!authResult) {
    return { authorized: false, course: null, user: null };
  }

  const ownershipResult = await verifyCourseOwnership(
    courseId,
    authResult.email
  );

  return {
    authorized: ownershipResult.authorized,
    course: ownershipResult.course,
    user: authResult,
  };
}

/**
 * Check if course is published (for public access)
 * @param {string} courseId - Course ID to check
 * @returns {Promise<boolean>}
 */
export async function isCoursePublished(courseId) {
  try {
    const course = await db
      .select()
      .from(CourseList)
      .where(eq(CourseList.courseId, courseId))
      .limit(1);

    return course.length > 0 && course[0].publish === true;
  } catch (error) {
    console.error("Course publish check error:", error);
    return false;
  }
}

