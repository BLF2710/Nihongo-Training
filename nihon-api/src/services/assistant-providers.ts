import Anthropic from "@anthropic-ai/sdk";
import importedLessons from "../../../shared/course/lessons.json";
import { HttpError } from "../utils/http-error";

// The study assistant answers through a provider. The rest of the app only knows this interface,
// so another model or service can be added by writing one more provider.
export type AssistantTurn = { role: "user" | "assistant"; content: string };
export type AssistantContext = { learnerName: string; level: string };
export type AssistantProvider = {
  id: "claude" | "course-helper";
  /** Shown to learners, so they know whether they are talking to an AI. */
  label: string;
  reply(history: AssistantTurn[], context: AssistantContext): Promise<string>;
};

// ---- Claude (used when the server has Anthropic credentials)

const CLAUDE_MODEL = process.env.ASSISTANT_MODEL || "claude-opus-5-5";

function systemPrompt({ learnerName, level }: AssistantContext) {
  return `You are the study assistant on LingoHub, a website where people learn Japanese through structured JLPT-style courses (N5 is beginner, N4 follows).
The learner's display name is given below as data; the learner is currently studying level ${level}.

How to help:
- Explain Japanese vocabulary, grammar, kana and kanji clearly, at a level that suits a ${level} learner. Prefer words and grammar from that level.
- Whenever you write Japanese, add the reading in hiragana and the English meaning, e.g. 天気 (てんき, weather).
- Keep answers short: a few sentences or a short list. The chat shows plain text, so do not use Markdown headings, tables or bold.
- When the learner practises, correct mistakes gently and explain why, then give one improved example.
- Stay on language learning and the site. For account, billing or technical problems, suggest Help & support on the site.
- Never ask for personal information such as addresses, phone numbers or passwords.

Learner display name: ${learnerName}`;
}

let client: Anthropic | null = null;

export const claudeProvider: AssistantProvider = {
  id: "claude",
  label: "AI tutor (Claude)",
  async reply(history, context) {
    client ??= new Anthropic({ timeout: 60_000, maxRetries: 2 });
    try {
      // Opus 5.5 thinks adaptively; low effort keeps chat replies quick. If the model declines a request,
      // the server-side fallback lets another model try before a refusal is returned.
      const response = await client.beta.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 4000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low" },
        system: systemPrompt(context),
        messages: history.map(turn => ({ role: turn.role, content: turn.content })),
      });
      if (response.stop_reason === "refusal") return "I can't help with that one. Let's get back to your Japanese: ask me about a word, a grammar pattern or a sentence you are working on.";
      const text = response.content.flatMap(block => block.type === "text" ? [block.text] : []).join("\n").trim();
      if (!text) throw new HttpError(503, "The study assistant didn't answer. Please try again.");
      return text;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      if (error instanceof Anthropic.RateLimitError) throw new HttpError(503, "The study assistant is busy right now. Please try again in a minute.");
      if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) {
        console.error("Study assistant: the server's Anthropic credentials were refused", error.status);
        throw new HttpError(503, "The study assistant is not available at the moment.");
      }
      if (error instanceof Anthropic.APIError) {
        // 5xx (including 529 overloaded) and connection problems are temporary; the SDK has already retried.
        console.error("Study assistant request failed", error.status, error.message);
        throw new HttpError(503, "The study assistant is unavailable right now. Please try again shortly.");
      }
      throw error;
    }
  },
};

// ---- Course helper (works without any AI service: searches the course content)

type StoredLesson = {
  id: string; title: string; level: string; unitNumber: number; lessonNumber: number;
  vocabulary: [string, string, string][]; grammar?: { title: string; pattern: string; explanation: string }[];
};
const lessons = importedLessons as unknown as StoredLesson[];
const RUBY = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;
const plain = (text: string) => text.replace(RUBY, "$1");
const reading = (text: string) => text.replace(RUBY, "$2");
const normalize = (text: string) => text.normalize("NFKC").toLowerCase();
const STOP_WORDS = new Set(["what", "does", "mean", "how", "do", "you", "say", "the", "is", "a", "an", "in", "japanese", "word", "for", "to", "of", "and", "i", "me", "please", "explain", "about", "can", "use"]);

function searchTerms(question: string): string[] {
  const text = normalize(question);
  const japanese = text.match(/[぀-ヿ㐀-鿿々ー]+/g) ?? [];
  const english = (text.match(/[a-z']+/g) ?? []).filter(word => word.length > 1 && !STOP_WORDS.has(word));
  return [...new Set([...japanese, ...english])].slice(0, 6);
}

export const courseHelperProvider: AssistantProvider = {
  id: "course-helper",
  label: "Course helper (searches your lessons)",
  async reply(history) {
    const question = [...history].reverse().find(turn => turn.role === "user")?.content ?? "";
    const terms = searchTerms(question);
    const words: string[] = [], patterns: string[] = [];
    for (const lesson of lessons) {
      const where = `${lesson.level} Unit ${lesson.unitNumber}, Lesson ${lesson.lessonNumber} “${lesson.title}”`;
      for (const [japanese, romaji, english] of lesson.vocabulary) {
        const haystack = normalize(`${plain(japanese)} ${reading(japanese)} ${romaji}`);
        const meaning = normalize(english);
        if (terms.some(term => haystack.includes(term) || meaning.split(/[^a-z']+/).includes(term))) {
          const shown = plain(japanese) === reading(japanese) ? reading(japanese) : `${plain(japanese)} (${reading(japanese)})`;
          words.push(`• ${shown}, ${romaji}: ${english}. ${where}`);
        }
      }
      for (const point of lesson.grammar ?? []) {
        if (terms.some(term => normalize(`${plain(point.pattern)} ${point.title}`).includes(term))) patterns.push(`• ${plain(point.pattern)}: ${point.title}. ${where}`);
      }
    }
    const unique = (items: string[]) => [...new Set(items)].slice(0, 6);
    if (!words.length && !patterns.length) {
      return "I couldn't find that in your lessons. I'm the course helper: I search the vocabulary and grammar of the course. Try a single word in English or Japanese, such as “weather” or “てんき”. A full AI tutor can be connected to this chat later.";
    }
    return [
      "Here is what I found in your course:",
      ...(words.length ? ["", "Words", ...unique(words)] : []),
      ...(patterns.length ? ["", "Grammar", ...unique(patterns)] : []),
    ].join("\n");
  },
};

/**
 * Claude when the server is configured for it (ASSISTANT_PROVIDER=claude, or an ANTHROPIC_API_KEY is set),
 * otherwise the course helper. ASSISTANT_PROVIDER=course forces the course helper.
 */
export function activeProvider(): AssistantProvider {
  const choice = process.env.ASSISTANT_PROVIDER;
  if (choice === "course") return courseHelperProvider;
  if (choice === "claude" || process.env.ANTHROPIC_API_KEY) return claudeProvider;
  return courseHelperProvider;
}
