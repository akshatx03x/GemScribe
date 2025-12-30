import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { generateContent } from '../services/geminiService';
const LoadingIndicator = () => (
  <div className="flex flex-col py-30 items-center justify-center text-center h-full">
    <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <p className="text-zinc-400 text-lg font-medium">Generating Prompt...</p>
    <p className="text-zinc-500 text-sm mt-2">This may take 10-20 seconds.</p>
  </div>
);
const GeminiChatUI = forwardRef((props, ref) => {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [responseText, setResponseText] = useState('');
  const textareaRef = useRef(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(true);
  const [isMarkdownLoaded, setIsMarkdownLoaded] = useState(false);

  useImperativeHandle(ref, () => ({
    generateReadme,
  }));

  const readmePromptTemplate = `
You are an expert open-source documentation writer.
Generate a *comprehensive, professional, and visually appealing README.md* file for a GitHub repository.
`;

  const generateReadme = async (repo) => {
    const owner = repo.owner ? repo.owner.login : 'Not specified';
    const languages = repo.language || 'Not specified';

    const readmeQuery = `
Repository Name: ${repo.name}
Owner: ${owner}
Description: ${repo.description || 'No description'}
Languages: ${languages}

Generate README in valid markdown.
`;

    setQuery(`Make README for ${repo.name}`);
    await handleAsk(readmeQuery);
  };

  // 🔥 ONLY CHANGE: BACKEND CALL
const handleAsk = async (apiQuery = query) => {
  if (!apiQuery || !apiQuery.trim()) return;

  setIsSearching(true);
  setIsPreviewing(true);
  setResponseText(''); 

  try {
    const answer = await generateContent(apiQuery);
    
    if (answer) {
        // 🔥 CLEANUP: Remove the triple backticks if they exist at the start/end
        // This ensures markdown-it renders the actual headers and lists
        const cleanAnswer = answer.replace(/^```markdown\n|```$/g, '');
        
        setResponseText(cleanAnswer);
        setQuery(''); 
    } else {
        setResponseText("Received an empty response from the server.");
    }
  } catch (error) {
    console.error('Frontend UI Error:', error);
    setResponseText(`Error: ${error.response?.data?.message || error.message}`);
  } finally {
    setIsSearching(false);
  }
};
const handleGoBack = () => {
  setIsSearching(false);
  setQuery('');
  setResponseText('');
  setIsCopied(false);
  setIsPreviewing(true);
};

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [query]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/markdown-it@13.0.1/dist/markdown-it.min.js";
    script.onload = () => setIsMarkdownLoaded(true);
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(responseText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handlePreview = () => {
    setIsPreviewing(!isPreviewing);
  };

const renderMarkdownPreview = () => {
  // Check if library is available
  if (isMarkdownLoaded && window.markdownit) {
    const md = window.markdownit({ 
        html: true, 
        linkify: true,
        breaks: true // Ensures line breaks work correctly
    });
    
    // Fallback if responseText is somehow empty during render
    return { __html: md.render(responseText || '') };
  }
  
  // Show a fallback while loading or if it fails
  return { __html: `<p style="color: #666">Formatting your README...</p>` };
};

  return (
    
<>
      <style>
        {`
          .custom-scrollbar {
            /* For Chrome, Safari, Edge */
            scrollbar-width: thin;
            scrollbar-color: #52525B transparent;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #52525B;
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: padding-box;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #71717A;
          }
          /* Style for the Markdown preview content */
          .markdown-body p, .markdown-body li {
            color: #e4e4e7;
          }
          .markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
            color: #f4f4f5;
          }
          .markdown-body a {
            color: #3b82f6;
          }
          .markdown-body pre {
            background-color: #1f2937;
            border-radius: 6px;
            padding: 1rem;
            overflow-x: auto;
          }
          .markdown-body code {
            background-color: #1f2937;
            color: #d1d5db;
          }

          @media (max-width: 767px) {
            .mobile-container-fix {
                position: relative !important;
                bottom: auto !important;
                right: auto !important;
                padding: 1rem;
            }
            .mobile-fix-title {
                font-size: 1.875rem; /* text-3xl */
            }
            .mobile-fix-title .small-text {
                font-size: 1rem; /* text-base */
            }
            .mobile-fix-input-bar {
                flex-direction: column;
                align-items: center;
                border-radius: 1.5rem; /* rounded-3xl */
            }
            .mobile-fix-input-bar .gem-text {
                margin-bottom: 0.5rem;
                margin-right: 0;
            }
            .mobile-fix-response-box {
                max-height: 70vh !important;
                height: auto !important;
            }
          }
        `}
      </style>
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      <div className="absolute bottom-10 right-10 w-full max-w-4xl p-8 z-50 flex flex-col items-end mobile-container-fix">
        {isSearching && ( 
          <div className="w-full max-w-3xl mx-auto mb-6 flex flex-col items-center">
            <button
              onClick={handleGoBack}
              className="mb-4 self-start flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-yellow-300 bg-yellow-950/40 rounded-full border border-yellow-700/60 shadow-md transition-all duration-300 ease-in-out hover:bg-yellow-950/60 hover:text-yellow-200 hover:border-yellow-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            <div className="w-full bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-blue-700/30 shadow-2xl transition-all duration-500 ease-in-out animate-fade-in-up mobile-fix-response-box" style={{ height: '60vh' }}>
              <div className="p-2 overflow-y-auto h-full custom-scrollbar">
                <div className="mt-4 text-zinc-300">
                  {responseText ? (
                    <>
                      <div className="flex justify-end space-x-2 mb-4">
                        <button
                          onClick={handleCopy}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                            isCopied ? 'bg-green-500 text-white' : 'bg-zinc-700 text-zinc-300 hover:bg-blue-600'
                          }`}
                        >
                          {isCopied ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={handlePreview}
                          className="px-4 py-2 rounded-full text-sm font-medium bg-zinc-700 text-zinc-300 hover:bg-blue-600 transition-colors duration-200"
                        >
                          {isPreviewing ? 'Hide Preview' : 'Show Preview'}
                        </button>
                      </div>
                      {isPreviewing ? (
                        <div className="markdown-body text-white" dangerouslySetInnerHTML={renderMarkdownPreview()}></div>
                      ) : (
                        <pre className="bg-zinc-800 p-4 rounded-md mb-4 overflow-x-auto text-zinc-300 whitespace-pre-wrap">{responseText}</pre>
                      )}
                    </>
                  ) : (
                    <LoadingIndicator />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {!isSearching && (
          <div className="w-full text-center mb-10">
            <div className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-blue-500 tracking-tight animate-fade-in-up mobile-fix-title">
              Hello, <span className='text-white text-3xl font-medium mobile-fix-title-text'>Want to Build Readme? </span><span className='text-2xl text-yellow-600 font-medium mobile-fix-title-text'>Choose your Repo!!!</span>
            </div>
          </div>
        )}
        <div className="w-full max-w-3xl mx-auto">
          <div className="relative flex items-end bg-zinc-900/50 backdrop-blur-xl p-3 rounded-full border border-blue-700/30 shadow-2xl transition-all duration-500 ease-in-out hover:border-blue-500/50 hover:shadow-blue-900/30 animate-fade-in mobile-fix-input-bar">
            <div className="flex items-center justify-center p-2 mr-2 gem-text">
              <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-yellow-500">GemScribe</span>
            </div>
            <div className="flex-1 overflow-y-auto max-h-40 custom-scrollbar pr-2">
              <textarea
                ref={textareaRef}
                className="w-full bg-transparent text-[16px] border-none text-zinc-100 placeholder-zinc-500 mb-1 focus:outline-none text-lg resize-none"
                placeholder="-You can Ask more just than Readme!!!"
                aria-label="Ask Gemscribe"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                rows="1"
              />
            </div>
            <button
              className="p-2 rounded-full text-zinc-400 hover:text-blue-300 hover:bg-zinc-700/50 transition-colors duration-200"
              onClick={() => handleAsk()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

export default GeminiChatUI;
