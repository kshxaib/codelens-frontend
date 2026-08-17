import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useAuthStore from "../store/authStore";

function Dashboard() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold"> CodeLens </h1>

          <div className="flex items-center gap-4">
            <img src={user.avatar_url} alt={user.username} className="h-9 w-9 rounded-full" />
            <span className="text-sm text-gray-300"> {user.username} </span>

            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
            >
              Logout
            </button>
          </div>

        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-bold"> Welcome, {user.username} </h2>
        <p className="mt-2 text-gray-400"> Select a repository to start understanding your codebase. </p>

        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-lg font-semibold"> My Repositories </h3>
          <button
            onClick={() => navigate("/repositories")}
            className="mt-6 rounded-lg bg-white px-5 py-3 font-medium text-black hover:bg-gray-200"
          >
            View My Repositories
          </button>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;