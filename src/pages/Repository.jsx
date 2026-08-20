import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useRepositoryStore from "../store/repositoryStore";
import useAuthStore from "../store/authStore";


function Repository() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [indexing, setIndexing] = useState(false);
  const [indexError, setIndexError] = useState("");

  const user = useAuthStore((state) => state.user);

  const repositories = useRepositoryStore((state) => state.repositories);
  const fetchRepositories = useRepositoryStore((state) => state.fetchRepositories);
  const indexRepository = useRepositoryStore((state) => state.indexRepository);
  const askRepository = useRepositoryStore((state) => state.askRepository);


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


  const handleIndex = async () => {
    setIndexing(true);
    setIndexError("");

    try {
      await indexRepository(Number(id));
    } catch (error) {
      setIndexError(error.response?.data?.detail || "Repository indexing failed");
    } finally {
      setIndexing(false);
    }
  };


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

            <span className={`rounded-full px-3 py-1 text-sm ${ repository.private ? "bg-yellow-500/10 text-yellow-400" : "bg-green-500/10 text-green-400"
              }`}>
              {repository.private ? "Private" : "Public"}
            </span>
          </div>

          <div className="mt-8 rounded-xl border border-gray-800 bg-gray-950 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Repository Index</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Scan and index the repository so CodeLens can understand its source files.
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-sm ${
                  repository.index_status === "indexed"
                    ? "bg-green-500/10 text-green-400"
                    : repository.index_status === "indexing"
                    ? "bg-blue-500/10 text-blue-400"
                    : repository.index_status === "failed"
                    ? "bg-red-500/10 text-red-400"
                    : "bg-gray-800 text-gray-400"
                }`}
              >
                {repository.index_status ===
                  "indexed"
                  ? "Indexed ✓"

                  : repository.index_status ===
                    "indexing"
                  ? "Indexing..."

                  : repository.index_status ===
                    "failed"
                  ? "Failed"
                  : "Not Indexed"}
              </span>
            </div>

            <div className="mt-6">
              <button
                onClick={handleIndex}
                disabled={
                  repository.index_status === "indexing" || indexing
                }
                className="rounded-lg bg-white px-5 py-3 font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {repository.index_status === "indexing" || indexing
                  ? "Indexing..."

                  : repository.index_status === "indexed"
                  ? "Re-index Repository"

                  : "Index Repository"}
              </button>

              {repository.index_status === "indexed" && (
                  <button
                    onClick={() =>
                      navigate(`/chat?repository=${repository.id}`)
                    }
                    className="rounded-lg border border-gray-700 px-5 py-3 font-medium text-white transition hover:bg-gray-800"
                  >
                    Open CodeLens Chat
                  </button>
              )}
            </div>

            {indexError && (
              <div className="mt-4 rounded-lg border border-red-900 bg-red-950/30 p-4">
                <p className="text-sm text-red-400">
                  {indexError}
                </p>
              </div>
            )}

            {repository.index_status ===
              "indexed" && (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-gray-900 p-4">
                  <p className="text-sm text-gray-500">
                    Files Scanned
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {repository.file_count}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-900 p-4">
                  <p className="text-sm text-gray-500">
                    Symbols
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {repository.symbol_count}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-900 p-4">
                  <p className="text-sm text-gray-500">
                    Indexed Commit
                  </p>
                  <p
                    className="mt-1 truncate font-mono text-sm"
                    title={
                      repository.last_indexed_commit
                    }
                  >
                    {repository.last_indexed_commit ||
                      "—"}
                  </p>
                </div>
              </div>
            )}
          </div>


          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gray-950 p-4">
              <p className="text-sm text-gray-500">
                Branch
              </p>
              <p className="mt-1 font-medium">
                {repository.default_branch}
              </p>
            </div>

            <div className="rounded-lg bg-gray-950 p-4">
              <p className="text-sm text-gray-500">
                Permission
              </p>
              <p className="mt-1 font-medium capitalize">
                {repository.permission || "read"}
              </p>
            </div>

            <div className="rounded-lg bg-gray-950 p-4">
              <p className="text-sm text-gray-500">
                Files
              </p>
              <p className="mt-1 font-medium">
                {repository.file_count}
              </p>
            </div>

            <div className="rounded-lg bg-gray-950 p-4">
              <p className="text-sm text-gray-500">
                Symbols
              </p>
              <p className="mt-1 font-medium">
                {repository.symbol_count}
              </p>
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}

export default Repository;