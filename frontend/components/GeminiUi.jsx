import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { generateContent } from "../services/geminiService";

const GeminiChatUI = forwardRef((props, ref) => {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [responseText, setResponseText] = useState("");
  const textareaRef = useRef(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(true);
  const [isMarkdownLoaded, setIsMarkdownLoaded] = useState(false);

  useImperativeHandle(ref, () => ({
    generateReadme,
  }));

  const readmePromptTemplate = `
You are an expert open-source documentation writer.
Generate a professional README.md file.

Repository:
- Name: {repoName}
- Owner: {owner}
- Description: {description}
- Language: {languages}

Return VALID MARKDOWN only.
`;

  const generateReadme = async (repo) => {
    const owner = repo.owner?.login || "Not specified";

    const readmeQuery = readmePromptTemplate
      .replace("{repoName}", repo.name)
      .replace("{owner}", owner)
      .replace("{description}", repo.description || "No description provided")
      .replace("{languages}", repo.language || "Not specified");

    setQuery(`Generate README for ${repo.name}`);
    await handleAsk(readmeQuery);
  };

  // ✅ FIXED: Backend Gemini call ONLY
  const handleAsk = async (apiQuery = query) => {
    if (!apiQuery.trim()) return;

    setIsSearching(true);
    setIsPreviewing(true);
    setResponseText("");

    try {
      const answer = await generateContent(apiQuery);
      setResponseText(answer.replace(/\*/g, ""));
    } catch (error) {
      console.error("Gemini error:", error);
      setResponseText("Error: Unable to generate response.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [query]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js";
    script.onload = () => setIsMarkdownLoaded(true);
    document.head.appendChild(script);

    return () => document.head.removeChild(script);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(responseText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const renderMarkdownPreview = () => {
    if (isMarkdownLoaded && window.markdownit) {
      const md = window.markdownit({ html: true, linkify: true });
      return { __html: md.render(responseText) };
    }
    return { __html: "<p>Loading preview...</p>" };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {responseText && (
        <div className="flex justify-end gap-2 mb-3">
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded bg-zinc-700 text-sm"
          >
            {isCopied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => setIsPreviewing(!isPreviewing)}
            className="px-3 py-1 rounded bg-zinc-700 text-sm"
          >
            {isPreviewing ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
      )}

      {responseText ? (
        isPreviewing ? (
          <div
            className="markdown-body text-zinc-200"
            dangerouslySetInnerHTML={renderMarkdownPreview()}
          />
        ) : (
          <pre className="bg-zinc-900 p-4 rounded text-zinc-200 whitespace-pre-wrap">
            {responseText}
          </pre>
        )
      ) : (
        isSearching && <p className="text-zinc-400">Generating response…</p>
      )}

      <div className="mt-6 flex items-center bg-zinc-900 rounded-full p-3">
        <textarea
          ref={textareaRef}
          className="flex-1 bg-transparent text-zinc-200 resize-none outline-none"
          placeholder="Ask GemScribe…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          onClick={() => handleAsk()}
          className="ml-3 px-4 py-2 rounded-full bg-blue-600 text-white"
        >
          →
        </button>
      </div>
    </div>
  );
});

export default GeminiChatUI;
