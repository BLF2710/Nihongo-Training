import { Navigate, useLocation } from 'react-router-dom';
import SectionTabs from '../../components/SectionTabs';
import AdminContent from './AdminContent';
import AdminLessons from './AdminLessons';
import AdminQuestionForm from './AdminQuestionForm';
import AdminQuestions from './AdminQuestions';

const SECTIONS = [
  { key: 'availability', label: 'Availability', icon: '🔌' },
  { key: 'questions', label: 'Question bank', icon: '❓' },
  { key: 'lessons', label: 'Lesson editor', icon: '✏️' },
] as const;
type Section = (typeof SECTIONS)[number]['key'];

/** Everything about course content on one page: availability, the review question bank and lesson edits. */
export default function AdminContentPage() {
  const { pathname } = useLocation();
  const [, , , section, sub] = pathname.split('/');
  if (!SECTIONS.some(item => item.key === section)) return <Navigate to="/admin/content/availability" replace />;
  const current = section as Section;
  return <>
    <SectionTabs label="Content sections" tabs={SECTIONS.map(item => ({ to: `/admin/content/${item.key}`, label: item.label, icon: item.icon }))} />
    {current === 'availability' && <AdminContent />}
    {current === 'questions' && (sub === 'new' ? <AdminQuestionForm /> : <AdminQuestions />)}
    {current === 'lessons' && <AdminLessons />}
  </>;
}
