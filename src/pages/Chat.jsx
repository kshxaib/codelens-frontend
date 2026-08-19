import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import useAuthStore from "../store/authStore";
import useRepositoryStore from "../store/repositoryStore";

import MessageBubble from "../components/chat/MessageBubble";
import ChatInput from "../components/chat/ChatInput";


function Chat() {
  const navigate = useNavigate();


  const [searchParams] = useSearchParams();
  const repositoryFromUrl = searchParams.get("repository");

  const user = useAuthStore((state) => state.user);
  const repositories = useRepositoryStore((state) => state.repositories);
  const fetchRepositories = useRepositoryStore((state) => state.fetchRepositories);

  const [repositoryId, setRepositoryId] = useState(repositoryFromUrl || "");

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);


  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || !repositoryId || loading) return;

    setError("");
    setQuestion("");
    setLoading(true);


    // Add user message
    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: trimmedQuestion,
      },
      {
        role: "assistant",
        content: "",
        sources: [],
      },
    ]);


    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/repositories/${repositoryId}/ask/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",

          body: JSON.stringify({
            question: trimmedQuestion,
          }),
        }
      );


      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to get answer");
      }

      if (!response.body) throw new Error("Streaming is not supported");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";


      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";


        for (const event of events) {
          if (!event.startsWith("data: ")) continue;

          const data = event.slice(6);

          if (data === "[DONE]") continue;

          const parsed = JSON.parse(data);

          if (parsed.type === "text") {
          setMessages((current) => {
            const updated = [...current ];
            const last = updated.length - 1;
            updated[last] = {...updated[last], content: updated[last].content + parsed.text};
            return updated;
          });

        }

        if (parsed.type === "sources") {
          setMessages((current) => {
            const updated = [...current];
            const last = updated.length - 1;
            updated[last] = {...updated[last], sources: parsed.sources};
            return updated;
          });
        }

        if (parsed.type === "error") {
          throw new Error(parsed.message);
        }
      }
    }

  } catch (error) {
    setError(error.message || "Something went wrong");

  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchRepositories();

  }, [user, navigate, repositories.length, fetchRepositories]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);


  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Header */}

      <header className="border-b border-gray-800">

        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">

          <h1 className="text-xl font-bold">
            CodeLens
          </h1>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="text-sm text-gray-400 hover:text-white"
          >
            Dashboard
          </button>

        </div>

      </header>


      {/* Main */}

      <main className="mx-auto flex max-w-5xl flex-col px-6 py-6">

        {/* Repository selector */}

        <div className="mb-6">

          <label className="mb-2 block text-sm text-gray-400">
            Repository
          </label>

          <select
            value={repositoryId}
            onChange={(event) =>
              setRepositoryId(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none"
          >

            <option value="">
              Select repository
            </option>

            {repositories
              .filter(
                (repo) =>
                  repo.index_status === "indexed"
              )
              .map((repo) => (

                <option
                  key={repo.id}
                  value={repo.id}
                >
                  {repo.full_name}
                </option>

              ))}

          </select>

        </div>


        {/* Chat */}

        <div className="min-h-[500px] rounded-xl border border-gray-800 bg-gray-900 p-5">

          {messages.length === 0 && (

            <div className="flex h-[450px] items-center justify-center text-center">

              <div>

                <h2 className="text-2xl font-semibold">
                  Ask about your codebase
                </h2>

                <p className="mt-2 text-gray-500">
                  Select a repository and ask a question.
                </p>

              </div>

            </div>

          )}


          {/* Messages */}

          <div className="space-y-5">
           {messages.map((message, index) => (
                <MessageBubble
                    key={index}
                    message={message}
                />
            ))}

            <div ref={messagesEndRef} />
          </div>
        </div>


        {/* Error */}

        {error && (
          <div className="mt-4 rounded-lg border border-red-900 bg-red-950/30 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}


        {/* Input */}
        <ChatInput
          question={question}
          setQuestion={setQuestion}
          onSubmit={handleSubmit}
          loading={loading}
          repositoryId={repositoryId}
        />
      </main>

    </div>
  );
}

export default Chat;