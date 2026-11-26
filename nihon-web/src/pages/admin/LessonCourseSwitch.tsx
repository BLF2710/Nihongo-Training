import { Link, useSearchParams } from 'react-router-dom';
import { ENGLISH_COURSE_PARAM, isEnglishCourseChosen } from './lessonCourse';

const COURSES = [{ label: 'Japanese', to: '/admin/content/lessons', isEnglish: false }, { label: 'English', to: `/admin/content/lessons?course=${ENGLISH_COURSE_PARAM}`, isEnglish: true }] as const;

/** Chooses which course's lessons the lesson editor lists. */
export function LessonCourseSwitch() {
  const isEnglish = isEnglishCourseChosen(useSearchParams()[0]);
  return <nav aria-label="Course" className="inline-flex rounded-xl bg-gray-100 p-1">{COURSES.map(course =>
    <Link key={course.label} to={course.to} aria-current={course.isEnglish === isEnglish ? 'page' : undefined}
      className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${course.isEnglish === isEnglish ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>{course.label}</Link>)}
  </nav>;
}
