import { useState } from "react";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { Link } from "react-router-dom";

export default function LoginPage() {

  const navigate = useNavigate();

  const [login, setLogin] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const handleLogin = async () => {

    try {

      setLoading(true);

      const response =
        await api.post(
          "/auth/login",
          {
            login,
            password
          }
        );

      localStorage.setItem(
        "token",
        response.data.token
      );
      localStorage.setItem("user_name", response.data.user?.username || login);
      localStorage.setItem("user_email", response.data.user?.email || "");

      navigate("/");

    } catch (error: unknown) {

      alert(
        (isAxiosError<{ message?: string }>(error) && error.response?.data?.message) ||
        "Login failed"
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
        justify-center
        items-center
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
          Login
        </h1>

        <input
          className="
            w-full
            border
            p-2
            mb-3
          "
          placeholder="Email or Username"
          value={login}
          onChange={(e) =>
            setLogin(
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
          onClick={handleLogin}
          disabled={loading}
          className="
            w-full
            bg-green-500
            text-white
            p-2
            rounded
          "
        >
          {
            loading
              ? "Logging in..."
              : "Login"
          }
        </button>
        <p className="mt-4 text-sm text-gray-600">New here? <Link className="text-emerald-700 font-semibold" to="/register">Create an account</Link></p>

      </div>
    </div>
  );
}
