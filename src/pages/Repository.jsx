import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import useRepositoryStore from "../store/repositoryStore";
import useAuthStore from "../store/authStore";


function Repository() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [indexError, setIndexError] = useState("");

  // Chat state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");

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
    setIndexError("");

    try {
      await indexRepository(Number(id));
    } catch (error) {
      setIndexError(error.response?.data?.detail || "Repository indexing failed");
    }
  };


  const handleAsk = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) return;

    setAsking(true);
    setAskError("");
    setAnswer(null);

    try {
      const result = await askRepository(Number(id), trimmedQuestion);

      setAnswer(result);

    } catch (error) {
      setAskError(
        error.response?.data?.detail || "Failed to get an answer"
      );

    } finally {
      setAsking(false);
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
                  repository.index_status ===
                  "indexing"
                }
                className="rounded-lg bg-white px-5 py-3 font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {repository.index_status ===
                  "indexing"
                  ? "Indexing..."

                  : repository.index_status ===
                    "indexed"
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


            <div className="mt-6 rounded-xl border border-gray-800 bg-gray-950 p-6">

            <div>

              <h2 className="text-lg font-semibold">
                Ask CodeLens
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Ask questions about this repository.
              </p>

            </div>


            {/* QUESTION FORM */}

            <form
              onSubmit={handleAsk}
              className="mt-5"
            >

              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                placeholder="e.g. Where is authentication implemented?"
                rows={4}
                disabled={asking}
                className="w-full resize-none rounded-lg border border-gray-800 bg-gray-900 p-4 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              />


              <div className="mt-3 flex justify-end">

                <button
                  type="submit"
                  disabled={
                    asking ||
                    !question.trim() ||
                    repository.index_status !== "indexed"
                  }
                  className="rounded-lg bg-white px-5 py-3 font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {asking
                    ? "Thinking..."
                    : "Ask CodeLens"}
                </button>

              </div>

            </form>


            {/* ERROR */}

            {askError && (
              <div className="mt-5 rounded-lg border border-red-900 bg-red-950/30 p-4">

                <p className="text-sm text-red-400">
                  {askError}
                </p>

              </div>
            )}


            {/* ANSWER */}

            {answer && (
              <div className="mt-6">

                <h3 className="text-sm font-semibold text-gray-300">
                  Answer
                </h3>


                <div className="mt-3 rounded-lg border border-gray-800 bg-gray-900 p-5">

                  <p className="whitespace-pre-wrap leading-7 text-gray-200">
                    {answer.answer}
                  </p>

                </div>


                {/* SOURCES */}

                {answer.sources?.length > 0 && (
                  <div className="mt-5">

                    <h3 className="text-sm font-semibold text-gray-300">
                      Sources
                    </h3>


                    <div className="mt-3 space-y-2">

                      {answer.sources.map(
                        (source, index) => (
                          <div
                            key={`${source.file_path}-${source.start_line}-${index}`}
                            className="rounded-lg border border-gray-800 bg-gray-900 p-4"
                          >

                            <div className="flex items-center justify-between gap-4">

                              <span className="font-mono text-sm text-gray-200">
                                {source.file_path}
                              </span>


                              <span className="shrink-0 text-xs text-gray-500">
                                Lines {source.start_line}-
                                {source.end_line}
                              </span>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

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