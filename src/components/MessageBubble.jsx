function MessageBubble({ message, onCitationClick }) {
  const isUser = message.role === "user";

  return (
    <div
      className={
        isUser
          ? "flex justify-end"
          : "flex justify-start"
      }
    >
      <div
        className={
          isUser
            ? "max-w-[80%] rounded-2xl bg-white px-5 py-3 text-black"
            : "max-w-[80%] rounded-2xl border border-gray-800 bg-gray-950 px-5 py-3 text-gray-200"
        }
      >
        <p className="whitespace-pre-wrap leading-7">
          {message.content}
        </p>

        {/* Sources */}
        {message.sources?.length > 0 && (
          <div className="mt-4 space-y-2 border-t border-gray-800 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Sources
            </p>

            {message.sources.map((source, index) => {
              const fileName = source.file || source.file_path;
              return (
                <button
                  key={`${fileName}-${source.start_line}-${index}`}
                  onClick={() => onCitationClick && onCitationClick(source)}
                  className="block w-full rounded-lg border border-gray-800 bg-gray-900 p-3 text-left transition hover:border-gray-600 hover:bg-gray-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-200">
                      {fileName}
                    </span>

                    <span className="text-xs text-gray-500">
                      {source.start_line}-{source.end_line}
                    </span>
                  </div>

                  {source.symbol && (
                    <p className="mt-1 text-xs text-gray-400">
                      {source.symbol}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;