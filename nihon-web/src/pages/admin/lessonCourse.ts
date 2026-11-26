/** `?course=english` lists the English course's lessons; without it, the Japanese course's. */
export const ENGLISH_COURSE_PARAM = 'english';

export const isEnglishCourseChosen = (params: URLSearchParams) => params.get('course') === ENGLISH_COURSE_PARAM;
