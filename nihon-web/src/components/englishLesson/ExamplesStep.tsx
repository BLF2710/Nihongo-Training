import type { Bilingual } from "../../../../shared/course/english/schema.ts";
import { SpeakButton } from "./SpeakButton";

/** Example sentences, each with its Vietnamese and a button to hear it. */
export function ExamplesStep({ examples }: { examples: readonly Bilingual[] }) {
  return <div>
    <h2 className="text-xl font-black sm:text-2xl">See it in a sentence <span lang="vi" className="text-base font-semibold text-gray-500">· Ví dụ</span></h2>
    <ul className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-2 sm:gap-3">{examples.map(example => <li key={example.english} className="flex items-start justify-between gap-3 rounded-2xl border px-3 py-2 sm:p-4">
      <p><span lang="en-GB" className="font-bold sm:text-lg">{example.english}</span> <span lang="vi" className="mt-0.5 block text-xs text-gray-600 sm:text-sm">{example.vietnamese}</span></p>
      <SpeakButton text={example.english} label="Hear this sentence" />
    </li>)}</ul>
  </div>;
}
