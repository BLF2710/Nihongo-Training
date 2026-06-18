import {
  useEffect,
  useState,
  useRef
} from "react";

import type {
  KeyboardEvent
} from "react";

import {
  useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../api/axios";

type Kana = {
  id: number;
  kana: string;
};

type AnswerResult = {
  correct: boolean;
  correctAnswer: string;
};

export default function PracticePage() {

  const navigate =
    useNavigate();

  const [current, setCurrent] =
    useState<Kana | null>(null);

  const [answer, setAnswer] =
    useState("");

  const [result, setResult] =
    useState<AnswerResult | null>(null);

  const [correctCount, setCorrectCount] =
    useState(0);

  const [wrongCount, setWrongCount] =
    useState(0);

  const [streak, setStreak] =
    useState(0);
  const [answered, setAnswered] =
    useState(false);

  const inputRef =
    useRef<HTMLInputElement>(null);

  const fetchKana = async () => {

    try {

      const res =
        await api.get(
          "/quiz/random"
        );

      setCurrent(res.data);
      setAnswer("");
      setResult(null);
      setAnswered(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);

    } catch (error) {

      console.error(error);

    }
  };

  useEffect(() => {

    fetchKana();

  }, []);

  const handleSubmit = async () => {

    if (!current) return;

    if (!answer.trim()) return;

    if (answered) return;

    try {

      const res =
        await api.post(
          "/quiz/answer",
          {
            hiraganaId: current.id,
            answer
          }
        );
      
      setResult(res.data);
      setAnswered(true);
      if (res.data.correct) {

        setCorrectCount(
          prev => prev + 1
        );

        setStreak(
          prev => prev + 1
        );

        setTimeout(() => {
          fetchKana();
        }, 800);

      } else {

        setWrongCount(
          prev => prev + 1
        );

        setStreak(0);

      }

    } catch (error) {

      console.error(error);

    }
  };

  const next = () => {

    fetchKana();

  };

  const total =
    correctCount + wrongCount;

  const accuracy =
    total === 0
      ? 0
      : (
          (correctCount / total)
          * 100
        ).toFixed(1);

  return (

    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <div
        className="
          max-w-5xl
          mx-auto
          px-6
          py-10
        "
      >

        <button
          onClick={() =>
            navigate("/")
          }
          className="
            border
            px-4
            py-2
            rounded
            mb-8
            hover:bg-gray-100
          "
        >
          ← Home
        </button>

        <div
          className="
            flex
            justify-center
            gap-8
            mb-12
            text-lg
            font-semibold
          "
        >
          <div>
            ✅ {correctCount}
          </div>

          <div>
            ❌ {wrongCount}
          </div>

          <div>
            🎯 {accuracy}%
          </div>

          <div>
            🔥 {streak}
          </div>
        </div>

        <div
          className="
            flex
            flex-col
            items-center
            gap-6
          "
        >

          <div
            className="
              text-9xl
              font-bold
              select-none
            "
          >
            {current?.kana}
          </div>

          <input
            ref={inputRef}
            className="
              border
              rounded-xl
              p-4
              text-2xl
              text-center
              w-72
            "
            placeholder="Type romaji..."
            value={answer}
            onChange={(e) =>
              setAnswer(
                e.target.value
              )
            }
              onKeyDown={(e) => {

                if (e.key !== "Enter") {
                  return;
                }

                if (result) {

                  if (!result.correct) {
                    next();
                  }

                  return;
                }

                handleSubmit();

              }}
          />

          <button
            disabled={answered}
            onClick={handleSubmit}
            className="
              bg-blue-500
              text-white
              px-8
              py-3
              rounded-xl
              hover:bg-blue-600
            "
          >
            Submit
          </button>

          {result && (

            <div className="text-center">

              {result.correct ? (

                <p
                  className="
                    text-green-600
                    text-xl
                    font-bold
                  "
                >
                  Correct ✅
                </p>

              ) : (

                <>
                  <p
                    className="
                      text-red-600
                      text-xl
                      font-bold
                    "
                  >
                    Wrong ❌
                  </p>

                  <p className="mt-2">
                    Correct answer:
                    {" "}
                    <strong>
                      {result.correctAnswer}
                    </strong>
                  </p>

                  <button
                    onClick={next}
                    className="
                      mt-4
                      bg-gray-800
                      text-white
                      px-4
                      py-2
                      rounded
                    "
                  >
                    Next
                  </button>

                </>

              )}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}