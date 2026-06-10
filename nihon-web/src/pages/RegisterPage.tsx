import { useState } from "react";
import api from "../api/axios";

export default function RegisterPage() {

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleRegister = async () => {

    try {

      setLoading(true);

      const response =
        await api.post(
          "/auth/register",
          {
            username,
            email,
            password
          }
        );

      alert(
        response.data.message
      );

      setUsername("");
      setEmail("");
      setPassword("");

    } catch (error: any) {

      alert(
        error.response?.data?.message ||
        "Register failed"
      );

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

      </div>
    </div>
  );
}