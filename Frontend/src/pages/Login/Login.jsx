import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  //HOOKS FOR LOGIN PROCESS
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  //NAVIGATION CONST
  const navigate = useNavigate();

  const handleLogIn = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMessage("");
      const response = await axios.post("http://localhost:3000/login", {
        email,
        password,
      });
      console.log(response);
      navigate("/");
    } catch (err) {
      setErrorMessage("Error al iniciar sesión");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gray-300">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
          <div className="w-full rounded-lg shadow-lg border border-black md:mt-0 sm:max-w-md xl:p-0">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8 bg-white rounded-lg">
              <h1 className="flex justify-center text-2xl font-bold leading-tight tracking-tight text-black">
                LOGIN
              </h1>
              <form className="space-y-4 md:space-y-6" action="#">
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-lg font-medium text-black"
                  >
                    Email
                  </label>
                  <input
                    type="text"
                    name="email"
                    id="email"
                    className="border border-black bg-white text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                    placeholder="example@example.com"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-lg font-medium text-black"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="••••••••"
                    className="border border-black bg-white text-gray-900 sm:text-sm rounded-lg block w-full p-2.5"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {errorMessage !== "" && (
                  <div
                    className="mb-2 rounded-lg bg-red-100 px-6 py-2 text-base text-red-700 text-center"
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full  text-white bg-gray-800 hover:bg-gray-600 font-bold rounded-lg text-md px-5 py-2.5 text-center disabled:opacity-50"
                  onClick={handleLogIn}
                  disabled={loading}
                >
                  Log In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
