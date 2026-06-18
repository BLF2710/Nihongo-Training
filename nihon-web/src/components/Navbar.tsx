import { useNavigate } from "react-router-dom";

export default function Navbar() {

  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const handleLogout = () => {

    localStorage.removeItem(
      "token"
    );

    navigate("/");
  };

  return (
    <header
      className="
        flex
        justify-between
        items-center
        p-6
        border-b
      "
    >

      <button
        onClick={() =>
          navigate("/")
        }
        className="
          text-xl
          font-bold
        "
      >
        Nihon Trainer
      </button>

      <div
        className="
          flex
          gap-4
        "
      >

        {token ? (
          <>
            <button
              onClick={() =>
                navigate(
                  "/statistics"
                )
              }
              className="
                bg-blue-500
                text-white
                px-4
                py-2
                rounded
              "
            >
              Statistics
            </button>

            <button
              onClick={
                handleLogout
              }
              className="
                bg-red-500
                text-white
                px-4
                py-2
                rounded
              "
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() =>
              navigate(
                "/login"
              )
            }
            className="
              bg-green-500
              text-white
              px-4
              py-2
              rounded
            "
          >
            Sign In
          </button>
        )}

      </div>

    </header>
  );
}