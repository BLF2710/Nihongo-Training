import RubyText from '../../components/RubyText';
import type { EditableLesson } from '../../api/lessonEdits';

/** How the edited lesson reads, with furigana rendered and correct answers marked. */
export default function LessonPreview({ lesson }: { lesson: EditableLesson }) {
  const questions = (title: string, list: EditableLesson['practice']) => <section><h4 className="font-black">{title}</h4><ol className="mt-1 list-decimal space-y-2 pl-5">{list.map((question, index) => <li key={index}>
    <RubyText text={question.prompt} /><ul className="text-sm">{question.options.map(option => <li key={option} className={option === question.correct ? 'font-bold text-emerald-700' : ''}>{option === question.correct ? '✓ ' : '• '}<RubyText text={option} /></li>)}</ul>
  </li>)}</ol></section>;
  return <article aria-label="Lesson preview" className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-5">
    <header><h3 className="text-2xl font-black"><RubyText text={lesson.title} /></h3>{lesson.titleJp && <p className="text-gray-600"><RubyText text={lesson.titleJp} /></p>}</header>
    <ul className="list-disc pl-5 text-sm">{lesson.objectives.map((objective, index) => <li key={index}><RubyText text={objective} /></li>)}</ul>
    <section><h4 className="font-black">Vocabulary</h4><table className="mt-1 text-sm"><tbody>{lesson.vocabulary.map(([word, romaji, meaning], index) => <tr key={index}><td className="pr-4 font-bold"><RubyText text={word} /></td><td className="pr-4 text-gray-500">{romaji}</td><td>{meaning}</td></tr>)}</tbody></table></section>
    <section><h4 className="font-black"><RubyText text={lesson.concept.title} /></h4><p className="whitespace-pre-line text-sm"><RubyText text={lesson.concept.text} /></p></section>
    <section><h4 className="font-black">Examples</h4>{lesson.examples.map(([japanese, english], index) => <p key={index} className="text-sm"><RubyText text={japanese} /> — {english}</p>)}</section>
    <section><h4 className="font-black">Conversation</h4>{lesson.dialogue.map(([a, lineA, b, lineB], index) => <div key={index} className="mt-1 text-sm"><p><b><RubyText text={a} />:</b> <RubyText text={lineA} /></p><p><b><RubyText text={b} />:</b> <RubyText text={lineB} /></p></div>)}</section>
    {questions('Practice', lesson.practice)}
    {questions('Challenge', lesson.challenge)}
  </article>;
}
