import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { HiOutlinePuzzle } from "react-icons/hi";
import EditCourseBasicInfo from "./EditCourseBasicInfo";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

function CourseBasicInfo({ course, refreshData, edit = true }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const { toast } = useToast();

  const onFileChanged = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setSelectedFile(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/courses/${course?.courseId}/banner`, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload banner");
      }

      toast({
        variant: "success",
        duration: 3000,
        title: "Image Uploaded Successfully!",
        description: "Image has been uploaded successfully.",
      });

      refreshData(true);
    } catch (error) {
      // console.log(error);
      toast({
        variant: "destructive",
        duration: 3000,
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
    }
  };

  return (
    <div className="p-10 border rounded-xl shadow-sm mt-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          {/* Title */}
          <h2 className="text-3xl font-bold flex gap-1">
            {course?.courseOutput?.CourseName}
            {edit && (
              <EditCourseBasicInfo
                course={course}
                size={50}
                refreshData={() => {
                  refreshData(true);
                }}
              />
            )}
          </h2>
          <p className="text-sm text-gray-400 mt-3">
            {course?.courseOutput?.Description}
          </p>
          <h2 className="font-medium mt-2 flex gap-2 items-center text-primary">
            <HiOutlinePuzzle size={20} />
            {course?.category}
          </h2>
          {!edit && (
            <Link href={`/course/${course?.courseId}/start`}>
              <Button className="w-full mt-5">Start</Button>
            </Link>
          )}
        </div>
        {/* Image */}
        <div>
          <label htmlFor="upload-image">
            <Image
              src={
                selectedFile
                  ? selectedFile
                  : course?.courseBanner || "/placeholder.png"
              }
              quality={100}
              priority={true}
              alt="placeholder image for course image"
              width={300}
              height={300}
              className={`w-full rounded-xl object-cover h-[250px] ${
                edit ? "cursor-pointer" : ""
              }`}
            />
          </label>
          {edit && (
            <input
              type="file"
              accept="image/*"
              id="upload-image"
              className="opacity-0"
              onChange={onFileChanged}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseBasicInfo;
