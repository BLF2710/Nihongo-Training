import BackButton from "../components/BackButton";
import { useState } from "react";
import { register } from "../api/auth";
import { apiErrorMessage } from "../api/errors";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");
  const [displayName, setDisplayName] = useState("");

  const [password, setPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] =
    useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) return alert("Passwords do not match");

    try {

      setLoading(true);

      const { message } = await register({ username, displayName, email, password, confirmPassword });

      alert(message);
      navigate("/login");

    } catch (error: unknown) {

      alert(apiErrorMessage(error, "Register failed"));

    } finally {

      setLoading(false);

    }
  };

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
      "
    >
      <div
        className="
          w-96
          border
          rounded-xl
          p-6
          shadow
        "
      >
        <BackButton className="mb-4 text-sm font-semibold text-gray-600 hover:underline" />
        <h1
          className="
            text-3xl
            font-bold
            mb-6
          "
        >
          Register
        </h1>

        <input
          className="
            w-full
            border
            p-2
            mb-3
          "
          placeholder="Username"
          value={username}
          onChange={(e) =>
            setUsername(
              e.target.value
            )
          }
        />

        <input className="w-full border p-2 mb-3" placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />

        <input
          className="
            w-full
            border
            p-2
            mb-3
          "
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
        />

        <input
          type="password"
          className="
            w-full
            border
            p-2
            mb-4
          "
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
        />

        <input type="password" className="w-full border p-2 mb-4" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="
            w-full
            bg-blue-500
            text-white
            p-2
            rounded
          "
        >
          {
            loading
              ? "Registering..."
              : "Register"
          }
        </button>
        <p className="mt-4 text-sm text-gray-600">Already have an account? <Link className="text-emerald-700 font-semibold" to="/login">Sign in</Link></p>

      </div>
    </div>
  );
}
