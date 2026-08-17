import { useState } from "react";
import useRepositoryStore from "../store/repositoryStore";

function AddRepository() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const addRepository = useRepositoryStore((state) => state.addRepository);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    try {
      await addRepository(url);
      setUrl("");
    } catch (error) {
      setError(error.response?.data?.detail || "Unable to add repository");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <h3 className="text-lg font-semibold"> Add Repository </h3>
      <p className="mt-1 text-sm text-gray-400"> Enter a GitHub repository URL. </p>

      <div className="mt-4 flex gap-3">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/owner/repository"
          className="flex-1 rounded-lg border border-gray-700 bg-gray-950 px-4 py-2 text-white outline-none focus:border-gray-500"
          required
        />

        <button type="submit" className="rounded-lg bg-white px-5 py-2 font-medium text-black hover:bg-gray-200">
          Add
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400"> {error} </p>}
    </form>
  );
}

export default AddRepository;