# API Security Documentation

## Overview

All API routes are now fully secured with authentication and ownership verification. This document outlines the security measures implemented.

## Security Features

### 1. Middleware Protection
- **Location**: `middleware.js`
- **Protection**: All API routes that modify data are protected
- **Public Access**: GET requests to published courses are allowed
- **Authentication**: Uses Clerk authentication middleware

### 2. Security Utility Functions
- **Location**: `lib/api-security.js`
- **Functions**:
  - `verifyAuth()` - Verifies user authentication
  - `verifyCourseOwnership()` - Checks if user owns a course
  - `verifyAuthAndOwnership()` - Combined authentication and ownership check
  - `isCoursePublished()` - Checks if course is publicly available

### 3. API Route Security

#### Courses API (`/api/courses`)

**GET /api/courses**
- ✅ Public access to published courses
- ✅ Requires authentication for user's own courses (when `createdBy` filter is used)
- ✅ Prevents accessing other users' courses

**POST /api/courses**
- ✅ Requires authentication
- ✅ Validates user can only create courses for themselves
- ✅ Prevents ownership spoofing

**GET /api/courses/[courseId]**
- ✅ Public access to published courses
- ✅ Requires ownership verification for unpublished courses
- ✅ Prevents unauthorized access to draft courses

**PUT /api/courses/[courseId]**
- ✅ Requires authentication
- ✅ Requires ownership verification
- ✅ Prevents changing course ownership

**DELETE /api/courses/[courseId]**
- ✅ Requires authentication
- ✅ Requires ownership verification
- ✅ Safely deletes associated resources (banner, chapters)

**PUT /api/courses/[courseId]/banner**
- ✅ Requires authentication
- ✅ Requires ownership verification

**PUT /api/courses/[courseId]/publish**
- ✅ Requires authentication
- ✅ Requires ownership verification

**POST /api/courses/[courseId]/content**
- ✅ Requires authentication
- ✅ Requires ownership verification

#### Chapters API (`/api/chapters`)

**GET /api/chapters**
- ✅ Public access to chapters of published courses
- ✅ Requires ownership for unpublished courses
- ✅ Prevents unauthorized access

**POST /api/chapters**
- ✅ Requires authentication
- ✅ Requires ownership verification of parent course

**DELETE /api/chapters/[courseId]**
- ✅ Requires authentication
- ✅ Requires ownership verification

#### Course Layout API (`/api/course/layout`)

**POST /api/course/layout**
- ✅ Requires authentication
- ✅ Prevents unauthorized AI usage

## Security Rules

### Ownership Verification
- All routes that modify data verify ownership
- Users can only modify their own courses
- Ownership is verified by comparing `createdBy` field with authenticated user's email

### Public vs Private Access
- **Published courses**: Publicly accessible (read-only)
- **Unpublished courses**: Only accessible by owner
- **Chapters**: Follow parent course visibility rules

### Authentication Flow
1. Middleware checks authentication for protected routes
2. API route verifies authentication using `verifyAuth()`
3. Ownership is verified using `verifyCourseOwnership()`
4. Operation proceeds only if all checks pass

## Error Responses

### 401 Unauthorized
- User is not authenticated
- Response: `{ error: "Unauthorized" }`

### 403 Forbidden
- User is authenticated but doesn't have permission
- Response: `{ error: "Forbidden: You don't own this course" }`

### 404 Not Found
- Resource doesn't exist
- Response: `{ error: "Course not found" }`

## Best Practices

1. **Always verify ownership** before modifying resources
2. **Use security utilities** from `lib/api-security.js` instead of manual checks
3. **Never trust client data** - always validate on server
4. **Log security violations** for monitoring
5. **Return generic errors** to prevent information leakage

## Testing Security

### Test Cases to Verify:
1. ✅ Unauthenticated user cannot create courses
2. ✅ User cannot modify other users' courses
3. ✅ User cannot delete other users' courses
4. ✅ Unpublished courses are not publicly accessible
5. ✅ Published courses are publicly readable
6. ✅ Ownership cannot be changed via API

## Security Checklist

- [x] All POST/PUT/DELETE routes require authentication
- [x] All modification routes verify ownership
- [x] Public routes only expose published content
- [x] Middleware protects API routes
- [x] Security utilities are centralized
- [x] Error messages don't leak sensitive information
- [x] Ownership validation prevents unauthorized access

## Future Enhancements

- Rate limiting per user
- API key authentication for external services
- Audit logging for security events
- Role-based access control (admin, moderator, etc.)
- Content moderation before publishing

