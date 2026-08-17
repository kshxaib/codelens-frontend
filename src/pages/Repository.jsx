import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useRepositoryStore from "../store/repositoryStore";
import useAuthStore from "../store/authStore";


function Repository() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);

  const repositories = useRepositoryStore((state) => state.repositories);
  const fetchRepositories = useRepositoryStore((state) => state.fetchRepositories);


  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (repositories.length === 0) {
      fetchRepositories();
    }
  }, [user, repositories.length, fetchRepositories, navigate]);


  const repository = repositories.find((repo) => String(repo.id) === id);


  if (!repository) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        Loading repository...
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <button
            onClick={() =>
              navigate("/repositories")
            }
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Back to repositories
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500">{repository.owner}</p>
              <h1 className="mt-1 text-3xl font-bold">{repository.name}</h1>
              <p className="mt-3 text-gray-400">{repository.description || "No description"}</p>
            </div>

            <span className="rounded-full bg-gray-800 px-3 py-1 text-sm">
              {repository.private ? "Private" : "Public"}
            </span>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gray-950 p-4">
              <p className="text-sm text-gray-500">Branch</p>
              <p className="mt-1 font-medium">{repository.default_branch}</p>
            </div>

            <div className="rounded-lg bg-gray-950 p-4">
              <p className="text-sm text-gray-500">Index Status</p>
              <p className="mt-1 font-medium">{repository.index_status}</p>
            </div>

            <div className="rounded-lg bg-gray-950 p-4">
              <p className="text-sm text-gray-500">Files</p>
              <p className="mt-1 font-medium">{repository.file_count}</p>
            </div>

            <div className="rounded-lg bg-gray-950 p-4">
              <p className="text-sm text-gray-500">Symbols</p>
              <p className="mt-1 font-medium">{repository.symbol_count}</p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-6">
            <p className="text-gray-400">Repository selected successfully.</p>
            <p className="mt-2 text-sm text-gray-500">Repository indexing will be implemented in Phase 4.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Repository;