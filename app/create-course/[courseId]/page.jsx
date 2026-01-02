"use client";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import CourseBasicInfo from "./_components/CourseBasicInfo";
import CourseDetail from "./_components/CourseDetail";
import ChapterList from "./_components/ChapterList";
import { Button } from "@/components/ui/button";
import LoadingDialog from "../_components/LoadingDialog";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function CourseLayout({ params }) {
  const Params = React.use(params);
  const { user } = useUser();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { toast } = useToast();

  useEffect(() => {
    // console.log(Params); //courseId
    // console.log(user);

    if (Params && user) {
      GetCourse();
    }
  }, [Params, user]);

  const GetCourse = async () => {
    try {
      const params = await Params;
      const response = await fetch(
        `/api/courses/${params?.courseId}?createdBy=${encodeURIComponent(
          user?.primaryEmailAddress?.emailAddress || ""
        )}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch course");
      }

      const result = await response.json();
      setCourse(result);
      // console.log("Course data:", result);
    } catch (error) {
      // console.error("Error fetching course:", error);
      toast({
        variant: "destructive",
        duration: 3000,
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  };

  const GenerateChapterContent = async () => {
    setLoading(true);

    try {
      const params = await Params;
      const response = await fetch(
        `/api/courses/${params?.courseId}/content?createdBy=${encodeURIComponent(
          user?.primaryEmailAddress?.emailAddress || ""
        )}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate course content");
      }

      const result = await response.json();

      // Show success toasts for each chapter
      if (result.chapters) {
        result.chapters.forEach((chapter) => {
          toast({
            duration: 2000,
            title: `Chapter ${chapter.chapterIndex + 1} Generated Successfully!`,
            description: `${chapter.chapterName} has been generated successfully!`,
          });
        });
      }

      toast({
        variant: "success",
        duration: 3000,
        title: "Course Content Generated Successfully!",
        description: "Course Content has been generated successfully!",
      });
      router.replace("/create-course/" + course?.courseId + "/finish");
    } catch (error) {
      console.log(error);
      toast({
        variant: "destructive",
        duration: 5000,
        title: "Uh oh! Something went wrong.",
        description: error?.message || "An unexpected error occurred!",
      });
      await GetCourse();
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <LoadingDialog loading={loading} />
      <div className="mt-10 px-7 md:px-20 lg:px-44">
        <h2 className="font-bold text-center text-2xl">Course Layout</h2>
        {/* Basic Info */}
        <CourseBasicInfo course={course} refreshData={() => GetCourse()} />
        {/* Course Detail */}
        <CourseDetail course={course} />
        {/* List of Lesson */}
        <ChapterList course={course} refreshData={() => GetCourse()} />

        <Button onClick={() => GenerateChapterContent()} className="my-10">
          Generate Course Content
        </Button>
      </div>
    </>
  );
}

export default CourseLayout;
