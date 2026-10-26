import { useEffect, useRef, useState } from "react";
import RubyText from "../RubyText";
import { apiErrorMessage } from "../../api/errors";
import { submitSpokenAnswer } from "../../api/speakingTest";
import type { SpeakingResult, SpeakingTask, SpokenAnswer } from "../../api/speakingTest";
import { MicrophoneError, startRecording } from "../../lib/wavRecorder";
import type { Recording, RecorderSession } from "../../lib/wavRecorder";
import { speakJapanese } from "../../services/japaneseSpeech";
import { recognitionErrorMessage, supportsSpeechRecognition, transcribeJapanese } from "../../services/japaneseSpeechRecognition";

const CONSENT_KEY = "speaking-test-consent:v1";
const TICK_MS = 200;
const KIND_LABEL: Record<SpeakingTask["kind"], string> = { read_aloud: "Read aloud", production: "Talk about it", interaction: "Conversation" };

type Phase =
  | { name: "ready" }
  | { name: "recording"; startedAt: number }
  | { name: "recorded"; recording: Recording; transcript: string }
  | { name: "grading"; recording: Recording; transcript: string };

const hasConsented = () => { try { return localStorage.getItem(CONSENT_KEY) === "yes"; } catch { return false; } };

/** Records one spoken answer to a task and sends it for grading. */
export default function SpeakingTaskRunner({ task, delivery, onGraded }: { task: SpeakingTask; delivery: "azure" | "browser"; onGraded: (result: SpeakingResult) => void }) {
  const [phase, setPhase] = useState<Phase>({ name: "ready" });
  const [consented, setConsented] = useState(hasConsented);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState<{ text: string; tone: "error" | "info" } | null>(null);
  const [showReadings, setShowReadings] = useState(true);
  const session = useRef<RecorderSession | null>(null);
  const transcriber = useRef<ReturnType<typeof transcribeJapanese> | null>(null);
  const canTranscribe = delivery === "azure" || supportsSpeechRecognition();

  useEffect(() => () => { session.current?.cancel(); void transcriber.current?.stop(); }, []);

  const stop = async () => {
    const current = session.current; if (!current) return;
    session.current = null;
    try {
      const [recording, transcript] = await Promise.all([current.stop(), transcriber.current?.stop() ?? Promise.resolve("")]);
      transcriber.current = null;
      setPhase({ name: "recorded", recording, transcript });
    } catch (failure) {
      setMessage({ text: failure instanceof MicrophoneError ? failure.message : "The recording couldn't be finished. Please try again.", tone: "error" });
      setPhase({ name: "ready" });
    }
  };

  // The timer also enforces the 30-second limit.
  useEffect(() => {
    if (phase.name !== "recording") return;
    const timer = window.setInterval(() => {
      const seconds = (Date.now() - phase.startedAt) / 1000;
      setElapsed(seconds);
      if (seconds >= task.maxSeconds) void stop();
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [phase, task.maxSeconds]);

  // Each recording's playback address is released once a newer recording (or leaving the task) replaces it.
  const playbackUrl = phase.name === "recorded" || phase.name === "grading" ? phase.recording.playbackUrl : null;
  useEffect(() => () => { if (playbackUrl) URL.revokeObjectURL(playbackUrl); }, [playbackUrl]);

  const record = async () => {
    setMessage(null); window.speechSynthesis?.cancel();
    try {
      session.current = await startRecording();
      if (delivery === "browser") transcriber.current = transcribeJapanese(code => setMessage({ text: recognitionErrorMessage(code), tone: "error" }));
      setElapsed(0); setPhase({ name: "recording", startedAt: Date.now() });
    } catch (failure) {
      setMessage({ text: failure instanceof MicrophoneError ? failure.message : "The microphone couldn't be started. Please try again.", tone: "error" });
    }
  };

  const submit = async (recording: Recording, transcript: string) => {
    setPhase({ name: "grading", recording, transcript }); setMessage(null);
    const answer: SpokenAnswer = delivery === "azure" ? { audio: recording.base64 } : { transcript, durationSeconds: Math.min(task.maxSeconds, Math.max(0.1, recording.seconds)) };
    try {
      const outcome = await submitSpokenAnswer(task.id, answer);
      if (outcome.status === "graded") { onGraded(outcome); setPhase({ name: "ready" }); return; }
      setMessage({ text: outcome.message, tone: "info" });
    } catch (failure) {
      setMessage({ text: apiErrorMessage(failure, "Your answer couldn't be graded. Please try again."), tone: "error" });
    }
    setPhase({ name: "recorded", recording, transcript });
  };

  const agree = () => { try { localStorage.setItem(CONSENT_KEY, "yes"); } catch { /* asked again next time */ } setConsented(true); };
  const text = task.kind === "read_aloud" ? task.passage : task.prompt;
  const short = phase.name === "recorded" && phase.recording.seconds < task.minSeconds;

  return <section aria-labelledby="task-heading" className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
    <p className="text-sm font-semibold text-emerald-700">{KIND_LABEL[task.kind]} · {task.minSeconds}–{task.maxSeconds} seconds</p>
    <h2 id="task-heading" className="mt-1 text-2xl font-black">{task.title}</h2>
    <p className="mt-2 text-gray-800">{task.instructions}</p>
    <p className="mt-1 text-sm text-gray-600">Can-do: {task.canDo}</p>
    {text && <div className="mt-4 rounded-xl bg-gray-50 p-4">
      {task.kind === "interaction" && <p className="text-sm font-semibold text-gray-600">{task.speaker ?? "The other speaker"} says</p>}
      <p lang="ja" className="text-xl leading-10 text-gray-900"><RubyText text={text.ruby} showReadings={showReadings} /></p>
      <div className="mt-2 flex flex-wrap gap-3 text-sm">
        <button type="button" onClick={() => speakJapanese(text.plain)} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-semibold text-gray-700 hover:border-emerald-500">🔊 {task.kind === "interaction" ? `Hear ${task.speaker ?? "them"}` : task.kind === "read_aloud" ? "Hear a model reading" : "Hear the question"}</button>
        <label className="flex items-center gap-2 text-gray-700"><input type="checkbox" className="accent-emerald-700" checked={showReadings} onChange={event => setShowReadings(event.target.checked)} /> Show readings</label>
      </div>
    </div>}

    {!consented ? <div className="mt-5 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-950">
      <p className="font-bold">Before your first recording</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {delivery === "azure" ? <li>Your recording is sent to Microsoft Azure to score pronunciation and fluency.</li> : <li>Your browser's speech recognition writes down what you say (in Chrome this uses Google's service). Pronunciation and fluency aren't scored on this site yet.</li>}
        <li>For talk and conversation tasks, the transcript is sent to Anthropic's AI to grade the content.</li>
        <li>Recordings are never stored. The transcript, scores and feedback are saved so you can see your history.</li>
      </ul>
      <button type="button" onClick={agree} className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700">I understand</button>
    </div> : !canTranscribe ? <p role="alert" className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">This browser can't recognise speech, and this site has no pronunciation service set up yet. Try Chrome or Edge.</p>
    : <div className="mt-5">
      {phase.name === "ready" && <button type="button" onClick={() => void record()} className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700">🎤 Start recording</button>}
      {phase.name === "recording" && <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={() => void stop()} className="rounded-xl bg-rose-600 px-5 py-3 font-bold text-white hover:bg-rose-700">■ Stop</button>
        <div className="min-w-48 flex-1"><p role="status" className="text-sm font-semibold text-gray-700"><span aria-hidden="true" className="mr-1 inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-rose-600" />Recording… {Math.floor(elapsed)} / {task.maxSeconds} s</p>
          <progress aria-label="Recording time" max={task.maxSeconds} value={Math.min(elapsed, task.maxSeconds)} className="mt-1 h-2 w-full accent-rose-600" /></div>
      </div>}
      {(phase.name === "recorded" || phase.name === "grading") && <div>
        <audio controls src={phase.recording.playbackUrl} className="w-full max-w-md" aria-label="Your recording" />
        <p className="mt-1 text-sm text-gray-600">{phase.recording.seconds.toFixed(1)} s recorded{delivery === "browser" && phase.transcript ? <> · heard: <span lang="ja">{phase.transcript}</span></> : ""}</p>
        {short && <p className="mt-1 text-sm text-amber-800">Shorter than the {task.minSeconds} seconds this task expects; a longer answer usually scores better.</p>}
        <div className="mt-3 flex flex-wrap gap-3">
          <button type="button" disabled={phase.name === "grading"} onClick={() => void submit(phase.recording, phase.transcript)} className="rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700 disabled:opacity-60">{phase.name === "grading" ? "Grading…" : "Submit for grading"}</button>
          <button type="button" disabled={phase.name === "grading"} onClick={() => void record()} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-bold text-gray-700 hover:border-emerald-500 disabled:opacity-60">Record again</button>
        </div>
        {phase.name === "grading" && <p role="status" className="mt-2 text-sm text-gray-600">Grading your answer. This can take up to a minute.</p>}
      </div>}
    </div>}
    {message && <p role={message.tone === "error" ? "alert" : "status"} className={`mt-4 rounded-xl p-3 text-sm ${message.tone === "error" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-900"}`}>{message.text}</p>}
  </section>;
}
