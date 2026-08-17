import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import useRepositoryStore from "../store/repositoryStore";
import useAuthStore from "../store/authStore";

import RepositoryCard from "../components/RepositoryCard";
import AddRepository from "../components/AddRepository";


function Repositories() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const repositories = useRepositoryStore((state) => state.repositories);
  const loading = useRepositoryStore((state) => state.loading);
  const error = useRepositoryStore((state) => state.error);

  const fetchRepositories = useRepositoryStore((state) => state.fetchRepositories);
  const removeRepository = useRepositoryStore((state) => state.removeRepository);


  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchRepositories();
  }, [user, navigate, fetchRepositories]);


  const handleSelect = (repository) => {
    navigate(`/repository/${repository.id}`);
  };


  const handleRemove = async (id) => {
    try {
      await removeRepository(id);
    } catch (error) {
      console.error(error);
    }
  };


  if (!user) {
    return null;
  }


  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">CodeLens</h1>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-400 hover:text-white"
          >
            Dashboard
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <h2 className="text-3xl font-bold">My Repositories</h2>
          <p className="mt-2 text-gray-400">Choose a repository to analyze.</p>
        </div>

        <div className="mt-8">
          <AddRepository />
        </div>

        {loading && (
          <p className="mt-8 text-gray-400">Loading repositories...</p>
        )}

        {error && (
          <p className="mt-8 text-red-400">{error}</p>
        )}


        {!loading &&
          repositories.length === 0 && (
            <div className="mt-8 rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
              <p className="text-gray-400">
                No repositories found.
              </p>
            </div>
          )}


        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {repositories.map(
            (repository) => (
              <RepositoryCard
                key={repository.id}
                repository={repository}
                onSelect={handleSelect}
                onRemove={handleRemove}
              />
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default Repositories;