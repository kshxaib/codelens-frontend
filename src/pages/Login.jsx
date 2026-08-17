import { githubLogin } from "../services/api";

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
      <div className="w-full max-w-md px-6">

        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">

          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">
              CodeLens
            </h1>

            <p className="mt-2 text-gray-400">
              AI-Powered Codebase Intelligence Copilot
            </p>
          </div>

          <button
            onClick={githubLogin}
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