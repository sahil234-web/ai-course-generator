import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

/* ---------------- COURSE LAYOUT ---------------- */
export async function generateCourseLayout() {
  const chat = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Generate A Course Tutorial on Following Details With field as Course Name, Description, Along with Chapter Name, about, Duration : Category: 'Programming', Topic: Java, Level:Basic,Duration:3 hours,NoOfChapters:5, in JSON format",
          },
        ],
      },
    ],
  });

  const result = await chat.sendMessage("Generate");
  return JSON.parse(result.response.text());
}

/* ---------------- CHAPTER CONTENT ---------------- */
export async function generateChapterContent() {
  const chat = model.startChat({
    generationConfig,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "Explain the concept in Detail on Topic: Springboot, Chapter: Advanced REST Controllers, in JSON Format with list of array with field as title, explanation on given chapter in detail, Code Example(Code field in <precode> format) if applicable.",
          },
        ],
      },
    ],
  });

  const result = await chat.sendMessage("Generate");
  return JSON.parse(result.response.text());
}
