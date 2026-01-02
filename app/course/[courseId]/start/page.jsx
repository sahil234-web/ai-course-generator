"use client";
import Skeleton from "react-loading-skeleton"; // Install via: npm install react-loading-skeleton
import "react-loading-skeleton/dist/skeleton.css"; // Import default styles
import { HiChevronDoubleLeft, HiArrowLeft } from "react-icons/hi";
import { HiBars3 } from "react-icons/hi2";
import ChapterListCard from "./_components/ChapterListCard";
import ChapterContent from "./_components/ChapterContent";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

function CourseStart({ params }) {
  const Params = React.use(params);
  const [course, setCourse] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedChapterContent, setSelectedChapterContent] = useState(null);
  const [handleSidebar, setHandleSidebar] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);
  const { toast } = useToast();

  const handleSideBarFunction = () => {
    setHandleSidebar(!handleSidebar);
  };

  useEffect(() => {
    if (Params) GetCourse();
  }, [Params]);

  useEffect(() => {
    if (course && course?.courseOutput?.Chapters?.length > 0) {
      const firstChapter = course?.courseOutput?.Chapters[0];
      setSelectedChapter(firstChapter);
      GetSelectedChapterContent(0);
    }
  }, [course]);

  useEffect(() => {
    setHandleSidebar(false);
  }, [selectedChapter]);

  const GetCourse = async () => {
    setCourseLoading(true);
    try {
      const params = await Params;
      const response = await fetch(`/api/courses/${params?.courseId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }

      const fetchedCourse = await response.json();
      setCourse(fetchedCourse);
    } catch (error) {
      // console.error(error);
      toast({
        variant: "destructive",
        duration: 3000,
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setCourseLoading(false);
    }
  };

  const GetSelectedChapterContent = async (chapterId) => {
    setContentLoading(true);
    try {
      const response = await fetch(
        `/api/chapters?courseId=${course?.courseId}&chapterId=${chapterId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch chapter content");
      }

      const result = await response.json();
      if (result.length > 0) {
        setSelectedChapterContent(result[0]);
      }
    } catch (error) {
      // console.log(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    } finally {
      setContentLoading(false);
    }
  };

  return (
    <div>
      {/* Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => handleSideBarFunction()}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <HiBars3 size={24} className="text-gray-600" />
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors"
            >
              <HiArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Dashboard</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <h2 className="font-medium text-lg text-gray-800 hidden md:block">
              {courseLoading ? (
                <Skeleton width={200} height={24} />
              ) : (
                course?.courseOutput?.CourseName
              )}
            </h2>
            <UserButton />
          </div>
        </div>
      </div>

      {/* Chapter list Side Bar : LHS */}
      <div
        className={`fixed md:w-72 overflow-scroll bg-white ${
          handleSidebar ? "block w-80 z-40" : "hidden"
        } md:block border-r shadow-sm`}
        style={{ top: "73px", height: "calc(100vh - 73px)" }}
      >
        <div className="flex bg-primary text-white justify-between p-4 items-center">
          <h2 className="font-medium text-lg">
            {courseLoading ? (
              <Skeleton width={150} />
            ) : (
              course?.courseOutput?.CourseName
            )}
          </h2>
          <HiChevronDoubleLeft
            size={25}
            className="cursor-pointer md:hidden hover:text-black pt-1"
            onClick={() => setHandleSidebar(false)}
          />
        </div>

        <div>
          {courseLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-4">
                  <Skeleton height={40} />
                </div>
              ))
            : course?.courseOutput?.Chapters.map((chapter, index) => (
                <div
                  key={index}
                  className={`cursor-pointer hover:bg-primary/30 ${
                    selectedChapter?.ChapterName === chapter?.ChapterName &&
                    "bg-primary/30"
                  }`}
                  onClick={() => {
                    setSelectedChapter(chapter);
                    GetSelectedChapterContent(index);
                  }}
                >
                  <ChapterListCard chapter={chapter} index={index} />
                </div>
              ))}
        </div>
      </div>

      {/* Content Div : RHS */}
      <div className="md:ml-72 p-10" style={{ marginTop: "73px" }}>
        {contentLoading ? (
          <div>
            <Skeleton height={30} width={200} />
            <Skeleton height={200} className="my-5" />
            <Skeleton height={150} count={3} className="my-3" />
          </div>
        ) : (
          <ChapterContent
            chapter={selectedChapter}
            content={selectedChapterContent}
            handleSideBarFunction={() => handleSideBarFunction()}
          />
        )}
      </div>
    </div>
  );
}

export default CourseStart;

// Without Skeleton Loading :

// "use client";
// import { db } from "@/configs/db";
// import { Chapters, CourseList } from "@/configs/schema";
// import { and, eq } from "drizzle-orm";
// import React, { useEffect, useState } from "react";
// import ChapterListCard from "./_components/ChapterListCard";
// import ChapterContent from "./_components/ChapterContent";
// import { HiChevronDoubleLeft } from "react-icons/hi";

// function CourseStart({ params }) {
//   const Params = React.use(params);
//   const [course, setCourse] = useState();
//   const [selectedChapter, setSelectedChapter] = useState();
//   const [selectedChapterContent, setSelectedChapterContent] = useState();
//   const [handleSidebar, setHandleSidebar] = useState(false);

//   const handleSideBarFunction = () => {
//     setHandleSidebar(!handleSidebar);
//   };

//   useEffect(() => {
//     if (Params) GetCourse();
//   }, [Params]);

//   useEffect(() => {
//     if (course && course?.courseOutput?.Chapters?.length > 0) {
//       const firstChapter = course?.courseOutput?.Chapters[0];
//       setSelectedChapter(firstChapter);
//       GetSelectedChapterContent(0);
//     }
//   }, [course]);

//   useEffect(() => {
//     setHandleSidebar(false);
//   }, [selectedChapter]);

//   const GetCourse = async () => {
//     try {
//       const result = await db
//         .select()
//         .from(CourseList)
//         .where(eq(CourseList.courseId, Params?.courseId));

//       if (result.length > 0) {
//         const fetchedCourse = result[0];
//         setCourse(fetchedCourse);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   // Fetching the chapter content
//   const GetSelectedChapterContent = async (chapterId) => {
//     try {
//       console.log("index : " + chapterId);

//       const result = await db
//         .select()
//         .from(Chapters)
//         .where(
//           and(
//             eq(Chapters.courseId, course?.courseId),
//             eq(Chapters.chapterId, chapterId)
//           )
//         );
//       console.log(result[0]);
//       setSelectedChapterContent(result[0]);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <div>
//       {/* Chapter list Side Bar : LHS */}
//       <div
//         className={`fixed md:w-72 bg-white ${
//           handleSidebar ? "block w-80 z-50" : "hidden"
//         } md:block h-screen border-r shadow-sm`}
//       >
//         <div className="flex bg-primary text-white justify-between p-4 items-center">
//           <h2 className="font-medium text-lg">
//             {course?.courseOutput?.CourseName}
//           </h2>
//           <HiChevronDoubleLeft
//             size={25}
//             className="cursor-pointer md:hidden hover:text-black pt-1"
//             onClick={() => setHandleSidebar(false)}
//           />
//         </div>

//         <div className="">
//           {course?.courseOutput?.Chapters.map((chapter, index) => (
//             <div
//               key={index}
//               className={`cursor-pointer hover:bg-primary/30 ${
//                 selectedChapter?.ChapterName == chapter?.ChapterName &&
//                 "bg-primary/30"
//               }`}
//               onClick={() => {
//                 setSelectedChapter(chapter);
//                 GetSelectedChapterContent(index);
//               }}
//             >
//               <ChapterListCard chapter={chapter} index={index} />
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Content Div : RHS */}
//       <div className="md:ml-72">
//         <ChapterContent
//           chapter={selectedChapter}
//           content={selectedChapterContent}
//           handleSideBarFunction={() => handleSideBarFunction()}
//         />
//       </div>
//     </div>
//   );
// }

// export default CourseStart;
