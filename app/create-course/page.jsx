"use client";
import { Button } from "@/components/ui/button";
import React, { useContext, useState } from "react";
import {
  HiMiniSquares2X2,
  HiLightBulb,
  HiClipboardDocumentCheck,
} from "react-icons/hi2";
import SelectCategory from "./_components/SelectCategory";
import TopicDescription from "./_components/TopicDescription";
import SelectOptions from "./_components/SelectOptions";
import { UserInputContext } from "../_context/UserInputContext";
import LoadingDialog from "./_components/LoadingDialog";
import uuid4 from "uuid4";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

function CreateCourse() {
  const StepperOptions = [
    { id: 1, name: "Category", icon: <HiMiniSquares2X2 /> },
    { id: 2, name: "Topic & Desc", icon: <HiLightBulb /> },
    { id: 3, name: "Options", icon: <HiClipboardDocumentCheck /> },
  ];

  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const { userCourseInput } = useContext(UserInputContext);
  const { user } = useUser();
  const router = useRouter();
  const { toast } = useToast();

  /* ---------- VALIDATION ---------- */
  const checkStatus = () => {
    if (
      activeIndex === 0 &&
      (!userCourseInput?.category || userCourseInput?.category === "Others")
    )
      return true;

    if (activeIndex === 1 && !userCourseInput?.topic) return true;

    if (
      activeIndex === 2 &&
      (!userCourseInput?.level ||
        !userCourseInput?.displayVideo ||
        !userCourseInput?.noOfChapters ||
        !userCourseInput?.duration ||
        userCourseInput.noOfChapters < 1 ||
        userCourseInput.noOfChapters > 20)
    )
      return true;

    return false;
  };

  /* ---------- API CALL (NO SDK) ---------- */
  const GenerateCourseLayout = async () => {
    try {
      setLoading(true);

      // Validate user input before making API call
      if (!userCourseInput?.category || !userCourseInput?.topic) {
        toast({
          variant: "destructive",
          duration: 3000,
          title: "Missing Information",
          description: "Please fill in all required fields.",
        });
        return;
      }

      const BASIC_PROMPT =
        "Generate A Course Tutorial on Following Details With field as Course Name, Description, Along with Chapter Name, about, Duration :\n";

      const USER_INPUT_PROMPT =
        "Category: " +
        userCourseInput?.category +
        ", Topic: " +
        userCourseInput?.topic +
        ", Level: " +
        userCourseInput?.level +
        ", Duration: " +
        userCourseInput?.duration +
        ", NoOfChapters: " +
        userCourseInput?.noOfChapters +
        ", in JSON format";

      const FINAL_PROMPT = BASIC_PROMPT + USER_INPUT_PROMPT;

      const res = await fetch("/api/course/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: FINAL_PROMPT }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle API errors with specific messages
        const errorMessage = data?.error || "Failed to generate course layout";
        throw new Error(errorMessage);
      }

      // Validate response structure
      if (!data || !data.CourseName || !data.Chapters || data.Chapters.length === 0) {
        throw new Error("Invalid course layout received from AI. Missing required fields.");
      }

      // Save to database
      try {
        await SaveCourseLayoutInDB(data);
        
        toast({
          variant: "success",
          duration: 3000,
          title: "Course Layout Generated Successfully!",
          description: `Generated ${data.Chapters.length} chapters for "${data.CourseName}"`,
        });
      } catch (saveError) {
        // Error already handled in SaveCourseLayoutInDB
        // Don't show duplicate error toast
        throw saveError;
      }
    } catch (error) {
      console.error("Error generating course layout:", error);
      toast({
        variant: "destructive",
        duration: 5000,
        title: "Failed to Generate Course Layout",
        description: error.message || "There was a problem generating your course layout. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- SAVE TO DB ---------- */
  const SaveCourseLayoutInDB = async (courseLayout) => {
    try {
      // Validate course layout before saving
      if (!courseLayout || !courseLayout.CourseName) {
        throw new Error("Invalid course layout data");
      }

      const id = uuid4();

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: id,
          name: userCourseInput?.topic,
          level: userCourseInput?.level,
          category: userCourseInput?.category,
          courseOutput: courseLayout,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          userName: user?.fullName,
          includeVideo: userCourseInput?.displayVideo,
          userProfileImage: user?.imageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error || `Failed to save course (Status: ${response.status})`;
        throw new Error(errorMessage);
      }

      const savedCourse = await response.json();
      
      // Navigate to course edit page only on success
      if (savedCourse && savedCourse.courseId) {
        router.replace(`/create-course/${id}`);
      } else {
        throw new Error("Course saved but invalid response received");
      }
    } catch (error) {
      console.error("Error saving course layout:", error);
      toast({
        variant: "destructive",
        duration: 5000,
        title: "Failed to Save Course",
        description: error.message || "Failed to save course layout. Please try again.",
      });
      throw error; // Re-throw to prevent navigation on error
    }
  };

  return (
    <div>
      {/* Stepper */}
      <div className="flex flex-col justify-center items-center mt-10">
        <h2 className="text-4xl text-primary font-medium">Create Course</h2>

        <div className="flex mt-10">
          {StepperOptions.map((item, index) => (
            <div className="flex items-center" key={item.id}>
              <div className="flex flex-col items-center w-[50px] md:w-[100px]">
                <div
                  className={`bg-gray-200 p-3 rounded-full text-white ${
                    activeIndex >= index && "bg-primary"
                  }`}
                >
                  {item.icon}
                </div>
                <h2 className="hidden md:block md:text-sm">{item.name}</h2>
              </div>
              {index !== StepperOptions.length - 1 && (
                <div
                  className={`h-1 w-[50px] md:w-[100px] lg:w-[170px] bg-gray-300 rounded-full ${
                    activeIndex - 1 >= index && "bg-primary"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-10 md:px-20 lg:px-44 mt-10">
        {activeIndex === 0 && <SelectCategory />}
        {activeIndex === 1 && <TopicDescription />}
        {activeIndex === 2 && <SelectOptions />}

        <div className="flex justify-between mt-10 mb-20">
          <Button
            disabled={activeIndex === 0}
            variant="outline"
            onClick={() => setActiveIndex(activeIndex - 1)}
          >
            Previous
          </Button>

          {activeIndex !== StepperOptions.length - 1 && (
            <Button
              onClick={() => setActiveIndex(activeIndex + 1)}
              disabled={checkStatus()}
            >
              Next
            </Button>
          )}

          {activeIndex === StepperOptions.length - 1 && (
            <Button disabled={checkStatus()} onClick={GenerateCourseLayout}>
              Generate Course Layout
            </Button>
          )}
        </div>
      </div>

      <LoadingDialog loading={loading} />
    </div>
  );
}

export default CreateCourse;
