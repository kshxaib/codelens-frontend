function RepositoryCard({repository, onSelect, onRemove }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{repository.name}</h3>
          <p className="text-sm text-gray-400">{repository.owner}</p>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs ${repository.private ? "bg-yellow-500/10 text-yellow-400" : "bg-green-500/10 text-green-400"}`}>
          {repository.private ? "Private": "Public"}
        </span>
      </div>

      <p className="mt-4 text-sm text-gray-400">{repository.description || "No description"}</p>

      <div className="mt-4 space-y-1 text-sm text-gray-500">
        <p>Branch: {repository.default_branch || "—"}</p>
        <p>Status: {repository.index_status}</p>
        <p>Files: {repository.file_count}</p>
        <p>Symbols: {repository.symbol_count}</p>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => onSelect(repository)}
          className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black hover:bg-gray-200"
        >
          Select
        </button>

        <button
          onClick={() => onRemove(repository.id)}
          className="rounded-lg border border-red-900 px-4 py-2 text-sm text-red-400 hover:bg-red-950"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default RepositoryCard;