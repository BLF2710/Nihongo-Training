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
              navigate("/practice")
            }
            className="
              w-60
              h-32
              bg-green-500
              text-white
              rounded-2xl
              text-2xl
              font-semibold
              shadow-lg
              hover:scale-105
              transition
            "
          >
            Hiragana
          </button>

          <button
            className="
              w-60
              h-32
              bg-gray-300
              rounded-2xl
              text-2xl
              font-semibold
              cursor-not-allowed
            "
          >
            Katakana
            <div className="text-sm mt-2">
              Coming Soon
            </div>
          </button>

          <button
            className="
              w-60
              h-32
              bg-gray-300
              rounded-2xl
              text-2xl
              font-semibold
              cursor-not-allowed
            "
          >
            Kanji
            <div className="text-sm mt-2">
              Coming Soon
            </div>
          </button>

        </div>

      </main>

    </div>
  );
}