import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { courseLessonSplit } from "./build-tools/courseLessonSplit";

const COURSE_LESSONS_FILE = fileURLToPath(new URL("../shared/course/lessons.json", import.meta.url));

export default defineConfig({
  plugins: [
    courseLessonSplit(COURSE_LESSONS_FILE),
    react(),
    tailwindcss()
  ]
});
