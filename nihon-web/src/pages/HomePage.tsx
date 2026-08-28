import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function HomePage() {

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <main
        className="
          flex
          flex-col
          items-center
          justify-center
          px-6
          py-20
        "
      >

        <h1
          className="
            text-5xl
            md:text-6xl
            font-bold
            mb-4
          "
        >
          Nihongo Trainer
        </h1>

        <p
          className="
            text-lg
            text-gray-600
            mb-12
          "
        >
          Learn Japanese characters the fun way
        </p>

        <div
          className="
            flex
            flex-col
            md:flex-row
            gap-6
          "
        >

          <button
            onClick={() =>
              navigate("/practice?type=hiragana")
            }
            className="
              w-64
              h-36
              bg-emerald-600
              hover:bg-emerald-700
              text-white
              rounded-2xl
              flex
              flex-col
              items-center
              justify-center
              shadow-lg
              hover:shadow-xl
              hover:scale-105
              transition-all
              cursor-pointer
            "
          >
            <span className="text-3xl font-bold">あ Hiragana</span>
            <span className="text-sm text-emerald-100 mt-1">46 Base + Variations</span>
          </button>

          <button
            onClick={() =>
              navigate("/practice?type=katakana")
            }
            className="
              w-64
              h-36
              bg-indigo-600
              hover:bg-indigo-700
              text-white
              rounded-2xl
              flex
              flex-col
              items-center
              justify-center
              shadow-lg
              hover:shadow-xl
              hover:scale-105
              transition-all
              cursor-pointer
            "
          >
            <span className="text-3xl font-bold">ア Katakana</span>
            <span className="text-sm text-indigo-100 mt-1">71 Characters Ready</span>
          </button>

          <button
            className="
              w-64
              h-36
              bg-gray-200
              text-gray-500
              rounded-2xl
              flex
              flex-col
              items-center
              justify-center
              cursor-not-allowed
              border
              border-gray-300
            "
          >
            <span className="text-3xl font-bold">漢 Kanji</span>
            <div className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full mt-2 font-medium">
              Coming Soon
            </div>
          </button>

        </div>

      </main>

    </div>
  );
}