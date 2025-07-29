"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/CodeEditor";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [history, setHistory] = useState<{ role: string; content: string }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);

    const newUserMessage = { role: "user", content: prompt };
    const updatedHistory = [...history, newUserMessage];

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, history: updatedHistory }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage = { role: "assistant", content: data.code || "// No code generated" };
        setGeneratedCode(data.code || "// Generated code will appear here");
        setHistory([...updatedHistory, assistantMessage]);
      } else {
        const errorMsg = "// Error generating code. Please try again.";
        setGeneratedCode(errorMsg);
        setHistory([...updatedHistory, { role: "assistant", content: errorMsg }]);
      }
    } catch (error) {
      const errorMsg = "// Error generating code. Please try again.";
      setGeneratedCode(errorMsg);
      setHistory([...updatedHistory, { role: "assistant", content: errorMsg }]);
    } finally {
      setIsGenerating(false);
      setPrompt("");
    }
  };


  return (
    <div className="min-h-screen bg-zinc-800 text-white">
      {/* Header */}
      <header className="border-b border-zinc-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <h1 className="text-xl font-bold">CodeGen Cursor</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-zinc-300 hover:text-white transition-colors">
                Features
              </a>
              <a href="#" className="text-zinc-300 hover:text-white transition-colors">
                Pricing
              </a>
              <a href="#" className="text-zinc-300 hover:text-white transition-colors">
                About
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Generate Code with AI
          </h2>
          <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
            Transform your ideas into working code instantly. Describe what you want to build, and let our AI generate the code for you.
          </p>
        </div>

        {/* Main Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-zinc-300 mb-2">
                  Describe what you want to build
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create a React component for a todo list with add, delete, and mark as complete functionality..."
                  className="w-full h-32 px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Generate Code</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Generated Code Display */}
          {generatedCode && (
            <div className="bg-zinc-900 rounded-2xl border border-zinc-700 p-6">
              {history.length > 0 && (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-6 space-y-4 max-h-96 overflow-y-auto">
                  {history.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`text-sm whitespace-pre-wrap p-3 rounded-md ${msg.role === "user"
                          ? "bg-zinc-700 text-white"
                          : "bg-green-700/30 text-green-300"
                        }`}
                    >
                      <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.content}
                    </div>
                  ))}
                </div>
              )}


              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Generated Code</h3>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedCode)}
                  className="text-zinc-400 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
              <CodeEditor code={generatedCode} />
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-zinc-400">Generate code in seconds, not minutes. Our AI is optimized for speed and accuracy.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Production Ready</h3>
            <p className="text-zinc-400">Get clean, well-structured code that follows best practices and is ready for production.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart & Intuitive</h3>
            <p className="text-zinc-400">Just describe what you want in plain English, and our AI understands your intent perfectly.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-zinc-400">
            <p>&copy; 2024 CodeGen Cursor. Built with Next.js and AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
