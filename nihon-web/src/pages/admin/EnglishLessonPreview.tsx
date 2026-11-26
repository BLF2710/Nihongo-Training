import type { EditableEnglishLesson } from '../../data/englishLessonEdits';

/** How the edited English lesson reads, with each Vietnamese line under its English and correct answers marked. */
export default function EnglishLessonPreview({ lesson }: { lesson: EditableEnglishLesson }) {
  const questions = (title: string, list: EditableEnglishLesson['practice']) => <section><h4 className="font-black">{title}</h4><ol className="mt-1 list-decimal space-y-2 pl-5">{list.map((question, index) => <li key={index}>
    {question.prompt}<ul className="text-sm">{question.options.map(option => <li key={option} className={option === question.correct ? 'font-bold text-emerald-700' : ''}>{option === question.correct ? '✓ ' : '• '}{option}</li>)}</ul>
  </li>)}</ol></section>;
  return <article aria-label="Lesson preview" className="grid gap-4 rounded-2xl border border-gray-200 bg-white p-5">
    <header><h3 className="text-2xl font-black">{lesson.title}</h3><p className="text-gray-600">{lesson.titleVi}</p></header>
    <ul className="list-disc pl-5 text-sm">{lesson.objectives.map((objective, index) => <li key={index}>{objective}</li>)}</ul>
    <section><h4 className="font-black">Vocabulary</h4><table className="mt-1 text-sm"><tbody>{lesson.vocabulary.map((word, index) => <tr key={index} className="align-top">
      <td className="pr-4 font-bold">{word.word}</td><td className="pr-4 text-gray-500">{word.ipa} · {word.partOfSpeech}</td>
      <td>{word.vietnamese}<p className="text-gray-600">{word.definition}</p><p className="italic">{word.example.english} <span className="text-gray-500">— {word.example.vietnamese}</span></p></td>
    </tr>)}</tbody></table></section>
    {lesson.grammar.map((point, index) => <section key={index}><h4 className="font-black">{point.title}</h4><p className="text-sm font-semibold">{point.pattern}</p>
      <p className="text-sm">{point.explanation.english}</p><p className="text-sm text-gray-600">{point.explanation.vietnamese}</p></section>)}
    <section><h4 className="font-black">Examples</h4>{lesson.examples.map((example, index) => <p key={index} className="text-sm">{example.english} <span className="text-gray-500">— {example.vietnamese}</span></p>)}</section>
    <section><h4 className="font-black">Conversation</h4>{lesson.dialogue.map((line, index) => <p key={index} className="mt-1 text-sm"><b>{line.speaker}:</b> {line.english} <span className="text-gray-500">— {line.vietnamese}</span></p>)}</section>
    {questions('Practice', lesson.practice)}
    {questions('Challenge', lesson.challenge)}
  </article>;
}
