function MessageBubble({ message }) {
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
          <div className="mt-4 border-t border-gray-800 pt-3">
            <p className="mb-2 text-xs font-semibold text-gray-500">
              Sources
            </p>

            <div className="space-y-1">
              {message.sources.map(
                (source, index) => (
                  <div
                    key={`${source.file_path}-${index}`}
                    className="font-mono text-xs text-gray-500"
                  >
                    {source.file_path}{" "}
                    ({source.start_line}-
                    {source.end_line})
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;