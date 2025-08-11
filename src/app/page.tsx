



"use client";
import { useState, FormEvent, ChangeEvent } from "react";

export default function Home() {
  // Chatbot state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Handle chat submit
  const handleChat = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLoading(true);
    setChatHistory(prev => [...prev, { role: "user", content: chatInput }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "assistant", content: "Error: Could not get response." }]);
    }
    setChatInput("");
    setChatLoading(false);
  };
  const [requirements, setRequirements] = useState("");
  const [testCases, setTestCases] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [qaReport, setQaReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [automationUrl, setAutomationUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [automationResult, setAutomationResult] = useState("");
  const [customSteps, setCustomSteps] = useState("");


  // Simulate AI test case generation
  const handleRequirements = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTestCases([]);
    setQaReport("");
    setTimeout(() => {
      // Simple mock: split requirements into test cases
      const cases = requirements
        .split("\n")
        .filter((line: string) => line.trim())
        .map((line: string, i: number) => `Test Case ${i + 1}: Validate "${line.trim()}"`);
      setTestCases(cases);
      setLoading(false);
    }, 1200);
  };

  // AI Generate & Run Automation handler
  const handleAIGenerateAndRun = async () => {
    if (!requirements.trim()) return;
    setLoading(true);
    setAutomationResult("");
    try {
      // 1. Generate Playwright steps from requirements
      const genRes = await fetch("/api/generate-playwright", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements })
      });
      const genData = await genRes.json();
      if (!genData.steps) throw new Error(genData.error || "No steps generated");
      // 2. Run Playwright automation with generated steps
      const runRes = await fetch("https://f04a62f7f0ae.ngrok-free.app/run-playwright", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customSteps: genData.steps })
      });
      const runData = await runRes.json();
      setAutomationResult(runData.result || runData.error || "No result");
    } catch (err) {
      const errorMsg = (err instanceof Error) ? err.message : "Could not complete automation.";
      setAutomationResult("Error: " + errorMsg);
    }
    setLoading(false);
  };

  // Simulate code upload and QA
  const handleFile = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setQaReport("");
    setTimeout(() => {
      // Simple mock: pretend to run tests and report
      setQaReport(
        `QA Report for ${file.name}:\n- All test cases executed.\n- 1 bug found: Example bug description.\n- See details above.`
      );
      setLoading(false);
    }, 1500);
  };

  // Run Playwright automation via API
  const handleAutomation = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setAutomationResult("");
    try {
  const res = await fetch("https://f04a62f7f0ae.ngrok-free.app/run-playwright", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: automationUrl, searchTerm, customSteps }),
      });
      const data = await res.json();
      setAutomationResult(data.result);
    } catch (err) {
      setAutomationResult("Error running automation.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">AI QA Engineer for Mount Sinai Health System</h1>

      {/* 1. Submit requirements/user stories */}

      <form onSubmit={handleRequirements} className="w-full max-w-md bg-white rounded-lg shadow p-6 mb-6 flex flex-col gap-4">
        <label className="font-semibold">Submit Requirements or User Stories</label>
        <textarea
          className="border rounded px-3 py-2 min-h-[80px]"
          placeholder="Enter requirements, one per line..."
          value={requirements}
          onChange={e => setRequirements(e.target.value)}
          required
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
            Generate Test Cases
          </button>
          <button type="button" className="bg-purple-600 text-white rounded px-4 py-2 hover:bg-purple-700 disabled:opacity-50" disabled={loading} onClick={handleAIGenerateAndRun}>
            AI Generate & Run Automation
          </button>
        </div>
      </form>

      {/* 2. Show generated test cases */}
      {testCases.length > 0 && (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6 mb-6">
          <strong>AI-Generated Test Cases:</strong>
          <ul className="list-disc pl-6 mt-2">
            {testCases.map(tc => (
              <li key={tc}>{tc}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Upload code/app for testing */}
      {testCases.length > 0 && (
        <form onSubmit={handleFile} className="w-full max-w-md bg-white rounded-lg shadow p-6 mb-6 flex flex-col gap-4">
          <label className="font-semibold">Upload Code or App Build for Testing</label>
          <input
            type="file"
            accept=".js,.ts,.py,.java,.txt,.json,.zip,.tar,.gz"
            onChange={e => setFile(e.target.files?.[0] || null)}
            required
          />
          <button type="submit" className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 disabled:opacity-50" disabled={loading || !file}>
            Run Automated Tests
          </button>
        </form>
      )}


      {/* 4. Show QA report */}
      {qaReport && (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6 text-gray-800">
          <strong>QA Report:</strong>
          <div className="mt-2 whitespace-pre-line">{qaReport}</div>
        </div>
      )}

      {/* 5. Run website automation with Playwright */}
      <form onSubmit={handleAutomation} className="w-full max-w-md bg-white rounded-lg shadow p-6 mb-6 flex flex-col gap-4">
        <label className="font-semibold">Run Automated Website Test (Playwright)</label>
        <input
          type="url"
          className="border rounded px-3 py-2"
          placeholder="Enter website URL (e.g. https://www.mountsinai.org)"
          value={automationUrl}
          onChange={e => setAutomationUrl(e.target.value)}
          required
        />
        <input
          type="text"
          className="border rounded px-3 py-2"
          placeholder="Enter search term (optional)"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <textarea
          className="border rounded px-3 py-2 min-h-[60px]"
          placeholder="Custom steps (e.g. type [selector] [text], click [selector], wait 1000, screenshot)"
          value={customSteps}
          onChange={e => setCustomSteps(e.target.value)}
        />
        <button type="submit" className="bg-purple-600 text-white rounded px-4 py-2 hover:bg-purple-700 disabled:opacity-50" disabled={loading}>
          Run Automation
        </button>
      </form>
      {automationResult && (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6 text-gray-800">
          <strong>Automation Result:</strong>
          <div className="mt-2 whitespace-pre-line">{automationResult}</div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-20 z-50">
          <div className="bg-white rounded-lg shadow p-6 text-lg font-semibold">AI is working...</div>
        </div>
      )}

      {/* 6. Chatbot UI */}
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 mt-6">
  <strong>Chat With Robiul Munna&apos;s Assistant</strong>
        <div className="h-48 overflow-y-auto border rounded p-2 my-2 bg-gray-50 text-sm">
          {chatHistory.length === 0 && <div className="text-gray-400">Start the conversation...</div>}
          {chatHistory.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "text-right" : "text-left text-blue-700"}>
              <span className="font-semibold">{msg.role === "user" ? "You" : "AI"}:</span> {msg.content}
            </div>
          ))}
        </div>
        <form onSubmit={handleChat} className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-3 py-2"
            placeholder="Ask anything..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            disabled={chatLoading}
            required
          />
          <button type="submit" className="bg-gray-800 text-white rounded px-4 py-2 hover:bg-gray-900 disabled:opacity-50" disabled={chatLoading || !chatInput.trim()}>
            {chatLoading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
