import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GeminiChatUI from "./components/GeminiUi.jsx";
import { authService } from "./services/authService";

const Dashboard = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const geminiChatRef = useRef(null);

  const handleLogout = async () => {
    try {
      setError("");
      await authService.logout();

      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error.message);
      setError("Failed to log out. Please try again.");
    }
  };

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const data = await authService.getRepos();
        if (data.success && Array.isArray(data.repos)) {
          setRepos(data.repos);
        } else {
          throw new Error("Invalid response format or no repos");
        }
      } catch (err) {
        console.error("Fetch Error:", err.message);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate("/login");
          return;
        }
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [navigate]);

  const handleMakeReadme = (repo) => {
    if (geminiChatRef.current?.generateReadme) {
      geminiChatRef.current.generateReadme(repo);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 flex flex-col md:flex-row items-center justify-between p-4 md:p-8">
        <div className="w-full md:w-[30%] max-w-md mb-6 md:mb-0 md:ml-8">
          <div className="animate-pulse flex items-center space-x-3">
            <div className="h-6 w-6 bg-blue-600/40 rounded-full"></div>
            <p className="text-lg text-zinc-400 font-inter">Loading repositories...</p>
          </div>
        </div>
        <div className="w-full md:w-[70%] max-w-4xl md:mr-8">
          <div className="bg-zinc-800/20 backdrop-blur-lg p-8 rounded-3xl border border-zinc-700/40 shadow-xl h-[40vh] md:h-[50vh] flex items-center justify-center">
            <p className="text-zinc-400 text-lg font-inter">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 flex flex-col md:flex-row items-center justify-between p-4 md:p-8">
        <div className="w-full md:w-[30%] max-w-md mb-6 md:mb-0 md:ml-8">
          <p className="text-lg text-red-500 font-inter bg-zinc-800/50 p-5 rounded-2xl border border-red-600/30">
            Error: {error}. Check console for details.
          </p>
        </div>
        <div className="w-full md:w-[70%] max-w-4xl md:mr-8">
          <div className="bg-zinc-800/20 backdrop-blur-lg p-8 rounded-3xl border border-zinc-700/40 shadow-xl h-[40vh] md:h-[50vh] flex items-center justify-center">
            <p className="text-zinc-400 text-lg font-inter">Error occurred. Please try again.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 p-4 md:p-8 flex flex-col md:flex-row font-inter">
      <div className="w-full md:w-[30%] max-w-md md:ml-8 mb-6 md:mb-0">
        <div className="mb-5">
          <h1 className="font-extrabold text-3xl md:text-5xl italic tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-yellow-400">
            Gemscribe <span className="text-sm md:text-lg font-medium">~AI Readme Generator</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 text-sm font-semibold text-yellow-300 bg-yellow-950/40 rounded-full border border-yellow-700/60 shadow-md transition-all duration-300 ease-in-out hover:bg-yellow-950/60 hover:text-yellow-200 hover:border-yellow-600"
            >
              Open Your Profile →
            </a>
            <button
              onClick={handleLogout}
              className="px-5 py-2 text-sm font-semibold bg-gray-800/50 backdrop-blur-md border border-red-700/50 hover:bg-red-700/50 text-red-400 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>

          <h1 className="text-2xl md:text-4xl mt-5 font-bold text-blue-300 tracking-wide bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Your <span className="text-white font-medium text-xl md:text-3xl">GitHub</span>{" "}
            <span className="text-lg md:text-2xl font-medium text-yellow-500">Repositories...</span>
          </h1>
        </div>

        {repos.length === 0 ? (
          <p className="text-zinc-500 text-base leading-relaxed bg-zinc-800/40 backdrop-blur-md p-5 rounded-2xl border border-zinc-700/30">
            No repositories found. Ensure you're logged in with GitHub and have granted repository access.
          </p>
        ) : (
          <ul className="space-y-4 max-h-[40vh] md:max-h-none overflow-y-auto pr-2">
            {repos.map((repo) => (
              <li
                key={repo.fullName}
                className="bg-zinc-800/20 backdrop-blur-lg p-4 rounded-3xl border border-zinc-700/40 hover:bg-zinc-800/50 transition-all duration-300 ease-in-out shadow-xl hover:shadow-2xl"
              >
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-zinc-100 tracking-tight">
                    {repo.name}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      repo.private
                        ? "bg-red-950/60 text-red-400 border-red-600/40"
                        : "bg-green-950/60 text-green-400 border-green-600/40"
                    } border`}
                  >
                    {repo.private ? "Private" : "Public"}
                  </span>
                </div>
                <a
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm font-medium hover:text-blue-400 mt-3 block"
                >
                  View on GitHub →
                </a>
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleMakeReadme(repo)}
                    className="px-3 py-2 text-sm font-semibold text-cyan-500 bg-cyan-950/40 rounded-full border border-cyan-700/60 shadow-md transition-all duration-300 ease-in-out hover:bg-cyan-950/60 hover:text-cyan-200"
                  >
                    Make Readme
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="w-full md:w-[70%]  max-w-full md:max-w-4xl md:mr-8 flex items-center justify-center mt-6 md:mt-0">
        <GeminiChatUI ref={geminiChatRef} id="gemini-chat-ui" className="w-full" />
      </div>
    </div>
    </>
  );
};

export default Dashboard;