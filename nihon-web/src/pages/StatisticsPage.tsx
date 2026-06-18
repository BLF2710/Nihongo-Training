import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import Navbar from "../components/Navbar";
import api from "../api/axios";

type Statistics = {
  totalCorrect: number;
  totalWrong: number;
  accuracy: number;
};

export default function StatisticsPage() {

  const navigate =
    useNavigate();

  const [stats, setStats] =
    useState<Statistics | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    const fetchStatistics =
      async () => {

        try {

          const res =
            await api.get(
              "/statistics"
            );

          setStats(res.data);

        } catch (error) {

          console.error(error);

        } finally {

          setLoading(false);

        }

      };

    fetchStatistics();

  }, []);

  if (loading) {

    return (
      <div>
        <Navbar />
        <div className="p-10">
          Loading...
        </div>
      </div>
    );

  }

  const totalAnswers =
    (stats?.totalCorrect || 0) +
    (stats?.totalWrong || 0);

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
          "
        >
          ← Home
        </button>

        <h1
          className="
            text-4xl
            font-bold
            text-center
            mb-10
          "
        >
          Statistics
        </h1>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-4
            gap-6
          "
        >

          <div
            className="
              bg-white
              rounded-xl
              shadow
              p-6
              text-center
            "
          >
            <div className="text-4xl">
              📝
            </div>

            <h2
              className="
                font-semibold
                mt-2
              "
            >
              Total Answers
            </h2>

            <p
              className="
                text-3xl
                font-bold
                mt-2
              "
            >
              {totalAnswers}
            </p>
          </div>

          <div
            className="
              bg-white
              rounded-xl
              shadow
              p-6
              text-center
            "
          >
            <div className="text-4xl">
              ✅
            </div>

            <h2
              className="
                font-semibold
                mt-2
              "
            >
              Correct
            </h2>

            <p
              className="
                text-3xl
                font-bold
                mt-2
              "
            >
              {stats?.totalCorrect}
            </p>
          </div>

          <div
            className="
              bg-white
              rounded-xl
              shadow
              p-6
              text-center
            "
          >
            <div className="text-4xl">
              ❌
            </div>

            <h2
              className="
                font-semibold
                mt-2
              "
            >
              Wrong
            </h2>

            <p
              className="
                text-3xl
                font-bold
                mt-2
              "
            >
              {stats?.totalWrong}
            </p>
          </div>

          <div
            className="
              bg-white
              rounded-xl
              shadow
              p-6
              text-center
            "
          >
            <div className="text-4xl">
              🎯
            </div>

            <h2
              className="
                font-semibold
                mt-2
              "
            >
              Accuracy
            </h2>

            <p
              className="
                text-3xl
                font-bold
                mt-2
              "
            >
              {stats?.accuracy}%
            </p>
          </div>

        </div>

      </div>

    </div>

  );
}