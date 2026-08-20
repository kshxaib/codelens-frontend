function CodeViewer({ source, onClose }) {
  if (!source) return null;

  const lines = source.content?.split("\n") || [];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-6">
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-xl border border-gray-800 bg-gray-950">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">

          <div>
            <h2 className="font-semibold text-white">
              {source.file}
            </h2>

            {source.symbol && (
              <p className="mt-1 text-sm text-gray-400">
                {source.symbol} · Lines {source.start_line}-{source.end_line}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-800"
          >
            Close
          </button>

        </div>


        {/* Code */}
        <div className="flex-1 overflow-auto p-4">

          <pre className="text-sm leading-6">

            {lines.map((line, index) => {

              const lineNumber = index + 1;

              // Citation ke exact lines highlight karo
              const isHighlighted =
                lineNumber >= source.start_line &&
                lineNumber <= source.end_line;

              return (
                <div
                  key={lineNumber}
                  className={`flex ${
                    isHighlighted
                      ? "bg-yellow-500/10"
                      : ""
                  }`}
                >

                  {/* Line number */}
                  <span className="w-14 shrink-0 select-none pr-4 text-right text-gray-600">
                    {lineNumber}
                  </span>

                  {/* Source code */}
                  <code
                    className={
                      isHighlighted
                        ? "text-yellow-200"
                        : "text-gray-300"
                    }
                  >
                    {line || " "}
                  </code>

                </div>
              );
            })}

          </pre>

        </div>

      </div>
    </div>
  );
}

export default CodeViewer;