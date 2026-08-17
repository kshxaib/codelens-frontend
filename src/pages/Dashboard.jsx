import { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../services/api";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        setUser(currentUser);
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [navigate]);


  async function handleLogout() {
    try {
      await logout();

      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading...
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <header className="border-b border-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <h1 className="text-xl font-bold">
            CodeLens
          </h1>

          <div className="flex items-center gap-4">

            {user?.avatar_url && (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="h-9 w-9 rounded-full"
              />
            )}

            <span className="text-sm text-gray-300">
              {user?.username}
            </span>

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

        <h2 className="text-3xl font-bold">
          Welcome, {user?.username}
        </h2>

        <p className="mt-2 text-gray-400">
          Select a repository to start understanding your codebase.
        </p>


        <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-6">

          <h3 className="text-lg font-semibold">
            My Repositories
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            Repository management will be added in Phase 3.
          </p>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;