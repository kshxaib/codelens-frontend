function ChatInput({ question, setQuestion, onSubmit, loading, repositoryId, }) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-4 flex gap-3"
    >
      <input
        value={question}
        onChange={(e)=> setQuestion(e.target.value)}
        placeholder="Ask about your code..."
        disabled={loading || !repositoryId}
        className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none placeholder:text-gray-600 disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={
          loading ||
          !repositoryId ||
          !question.trim()
        }
        className="rounded-lg bg-white px-6 py-3 font-medium text-black transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Send"}
      </button>
    </form>
  );
}

export default ChatInput;