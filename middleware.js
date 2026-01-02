import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/create-course(.*)",
]);

// Protected API routes that require authentication
const isProtectedApiRoute = createRouteMatcher([
  "/api/courses(.*)", // All course routes
  "/api/chapters(.*)", // All chapter routes
  "/api/course/layout", // Course layout generation
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect dashboard and create-course routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // Protect API routes that modify data
  if (isProtectedApiRoute(req)) {
    // Allow GET requests to public courses, but protect all other methods
    const isGetRequest = req.method === "GET";
    const isPublicCourseGet = 
      isGetRequest && 
      (req.nextUrl.pathname.includes("/api/courses/") || 
       req.nextUrl.pathname.includes("/api/chapters"));

    if (!isPublicCourseGet) {
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
