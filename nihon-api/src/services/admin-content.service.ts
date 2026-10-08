import { LESSONS } from './lesson.service';
import { UNITS } from '../data/units';
import { listDisabledContentKeys } from '../repositories/site.repository';
export type ManagedContent = { key:string; title:string; category:string; paths:string[]; source:string };
export const CONTENT: ManagedContent[] = [
  ...LESSONS.map(lesson=>({key:`lesson:${lesson.id}`,title:lesson.title,category:'Lessons',paths:[`/lessons/japanese/${lesson.slug}`],source:'Course source files'})),
  ...UNITS.filter(unit=>unit.assessmentId && !unit.isPlaceholder).map(unit=>({key:`assessment:${unit.id}`,title:`Unit ${unit.number}: ${unit.title}`,category:'Quizzes',paths:[`/quizzes/${unit.id}`],source:'Assessment source files'})),
  {key:'vocabulary',title:'Japanese vocabulary & flashcards',category:'Vocabulary',paths:['/vocabulary'],source:'Existing course vocabulary'},
  {key:'grammar',title:'Japanese grammar references',category:'Grammar',paths:['/grammar'],source:'Existing course grammar'},
  {key:'hiragana',title:'Hiragana learning',category:'Kana & Kanji',paths:['/learn/hiragana'],source:'Existing character catalog'},
  {key:'katakana',title:'Katakana learning',category:'Kana & Kanji',paths:['/learn/katakana'],source:'Existing character catalog'},
  {key:'kanji',title:'Kanji learning & flashcards',category:'Kana & Kanji',paths:['/learn/kanji'],source:'Existing Kanji catalog'},
  {key:'kana-practice',title:'Kana speed quizzes & review',category:'Games',paths:['/practice','/review/hiragana','/review/katakana'],source:'Shared Kana quiz engine'},
  {key:'kanji-practice',title:'Kanji practice',category:'Games',paths:['/learn/kanji/practice'],source:'Existing Kanji quiz engine'},
  {key:'english-games',title:'English word match & scramble',category:'Games',paths:['/arcade','/games/english'],source:'Existing English arcade'},
];
export const isManagedContent = (key: string) => CONTENT.some(item => item.key === key);
export async function getDisabledContent() {
  const disabledKeys = await listDisabledContentKeys();
  return CONTENT.filter(item => disabledKeys.includes(item.key));
}
