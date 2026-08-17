import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

function Login() {
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="w-full max-w-md px-6">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
            
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">CodeLens</h1>
            <p className="mt-2 text-gray-400"> AI-Powered Codebase Intelligence Copilot </p>
          </div>

          <button
            onClick={login}
            className="w-full rounded-lg bg-white px-4 py-3 font-medium text-black transition hover:bg-gray-200"
          >
            Continue with GitHub
          </button>

        </div>
      </div>
    </div>
  );
}

export default Login;