  // Plain English Test Authoring state
  const [plainEnglishSteps, setPlainEnglishSteps] = useState("");
  const [generatedPlaywright, setGeneratedPlaywright] = useState("");
  const [plainGenLoading, setPlainGenLoading] = useState(false);
  const [plainRunResult, setPlainRunResult] = useState("");

  // Handler: Generate Playwright code from plain English
  const handleGeneratePlaywrightFromEnglish = async () => {
    if (!plainEnglishSteps.trim()) return;
    setPlainGenLoading(true);
    setGeneratedPlaywright("");
    setPlainRunResult("");
    try {
      const res = await fetch("/api/english-to-playwright", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: plainEnglishSteps })
      });
      const data = await res.json();
      setGeneratedPlaywright(data.code || data.error || "No code generated.");
    } catch (err) {
      setGeneratedPlaywright("Error: Could not generate code.");
    }
    setPlainGenLoading(false);
  };

  // Handler: Run generated Playwright code
  const handleRunGeneratedPlaywright = async () => {
    if (!generatedPlaywright.trim()) return;
    setPlainRunResult("Running...");
    try {
      const res = await fetch("/api/run-playwright-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: generatedPlaywright })
      });
      const data = await res.json();
      setPlainRunResult(data.result || data.error || "No result.");
    } catch (err) {
      setPlainRunResult("Error: Could not run code.");
    }
  };
      {/* Plain English Test Authoring */}
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6 mb-6 flex flex-col gap-4">
        <label className="font-semibold">Plain English Test Authoring</label>
        <textarea
          className="border rounded px-3 py-2 min-h-[60px]"
          placeholder="Describe your test steps in plain English..."
          value={plainEnglishSteps}
          onChange={e => setPlainEnglishSteps(e.target.value)}
        />
        <button
          type="button"
          className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700 disabled:opacity-50"
          disabled={plainGenLoading || !plainEnglishSteps.trim()}
          onClick={handleGeneratePlaywrightFromEnglish}
        >
          {plainGenLoading ? "Generating..." : "Generate Playwright Code"}
        </button>
        {generatedPlaywright && (
          <div className="bg-gray-100 rounded p-3 mt-2">
            <strong>Generated Playwright Code:</strong>
            <pre className="whitespace-pre-wrap text-xs mt-2">{generatedPlaywright}</pre>
            <button
              type="button"
              className="mt-2 bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
              onClick={handleRunGeneratedPlaywright}
            >
              Run This Test
            </button>
          </div>
        )}
        {plainRunResult && (
          <div className="bg-gray-50 rounded p-3 mt-2 text-sm">
            <strong>Test Result:</strong>
            <div className="mt-1 whitespace-pre-line">{plainRunResult}</div>
          </div>
        )}
      </div>
"use client";
import { useState, FormEvent, ChangeEvent } from "react";


export default function Home() {
  // Chatbot state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [testCases, setTestCases] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [qaReport, setQaReport] = useState("");
  const [loading, setLoading] = useState(false);
  const [automationUrl, setAutomationUrl] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [automationResult, setAutomationResult] = useState("");
  const [automationScreenshot, setAutomationScreenshot] = useState<string | null>(null);
  const [automationStatus, setAutomationStatus] = useState<string>("");
  const [automationLogs, setAutomationLogs] = useState<string[]>([]);
  const [customSteps, setCustomSteps] = useState("");
  const [analysisResult, setAnalysisResult] = useState("");
  const [testPlan, setTestPlan] = useState("");
  const [testData, setTestData] = useState("");
  const [testDataMask, setTestDataMask] = useState(false);

  // Requirement Analysis handler
  const handleAnalyzeRequirements = async () => {
    if (!requirements.trim()) return;
    setLoading(true);
    setAnalysisResult("");
    try {
      const res = await fetch("/api/analyze-requirements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements })
      });
      const data = await res.json();
      setAnalysisResult(data.analysis || data.error || "No analysis result.");
    } catch (err) {
      setAnalysisResult("Error: Could not analyze requirements.");
    }
    setLoading(false);
  };

  // Test Plan Generation handler
  const handleGenerateTestPlan = async () => {
    if (!requirements.trim()) return;
    setLoading(true);
    setTestPlan("");
    try {
      const res = await fetch("/api/generate-test-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements })
      });
      const data = await res.json();
      setTestPlan(data.testPlan || data.error || "No test plan generated.");
    } catch (err) {
      setTestPlan("Error: Could not generate test plan.");
    }
    setLoading(false);
  };

  // Test Data Generation handler
  const handleGenerateTestData = async () => {
    if (!requirements.trim() && testCases.length === 0) return;
    setLoading(true);
    setTestData("");
    try {
      const res = await fetch("/api/generate-test-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements, testCases: testCases.join("\n"), maskSensitive: testDataMask })
      });
      const data = await res.json();
      setTestData(data.testData || data.error || "No test data generated.");
    } catch (err) {
      setTestData("Error: Could not generate test data.");
    }
    setLoading(false);
  };

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
    setAutomationScreenshot(null);
    setAutomationStatus("Running...");
    setAutomationLogs([]);
    try {
      // 1. Generate Playwright steps from requirements
      setAutomationStatus("Generating Playwright steps...");
      const genRes = await fetch("/api/generate-playwright", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements })
      });
      const genData = await genRes.json();
      if (!genData.steps) throw new Error(genData.error || "No steps generated");
      setAutomationLogs(logs => [...logs, "Steps generated:", genData.steps]);
      // 2. Run Playwright automation with generated steps
      setAutomationStatus("Running Playwright automation...");
      const runRes = await fetch("https://f04a62f7f0ae.ngrok-free.app/run-playwright", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customSteps: genData.steps })
      });
      const runData = await runRes.json();
      setAutomationResult(runData.result || runData.error || "No result");
      if (runData.logs) setAutomationLogs(logs => [...logs, ...runData.logs]);
      if (runData.screenshotBase64) {
        setAutomationScreenshot(runData.screenshotBase64);
      }
      setAutomationStatus("Completed");
    } catch (err) {
      const errorMsg = (err instanceof Error) ? err.message : "Could not complete automation.";
      setAutomationResult("Error: " + errorMsg);
      setAutomationStatus("Error");
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
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
            Generate Test Cases
          </button>
          <button type="button" className="bg-purple-600 text-white rounded px-4 py-2 hover:bg-purple-700 disabled:opacity-50" disabled={loading} onClick={handleAIGenerateAndRun}>
            AI Generate & Run Automation
          </button>
          <button type="button" className="bg-orange-500 text-white rounded px-4 py-2 hover:bg-orange-600 disabled:opacity-50" disabled={loading} onClick={handleAnalyzeRequirements}>
            Analyze Requirements
          </button>
          <button type="button" className="bg-cyan-600 text-white rounded px-4 py-2 hover:bg-cyan-700 disabled:opacity-50" disabled={loading} onClick={handleGenerateTestPlan}>
            Generate Test Plan
          </button>
          <button type="button" className="bg-teal-700 text-white rounded px-4 py-2 hover:bg-teal-800 disabled:opacity-50" disabled={loading} onClick={handleGenerateTestData}>
            Generate Test Data
          </button>
          <label className="flex items-center gap-1 text-xs text-gray-600">
            <input type="checkbox" checked={testDataMask} onChange={e => setTestDataMask(e.target.checked)} /> Mask sensitive
          </label>
        </div>
      {/* Requirement Analysis Result */}
      {analysisResult && (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6 mb-6">
          <strong>Requirement Analysis:</strong>
          <div className="mt-2 whitespace-pre-line">{analysisResult}</div>
        </div>
      )}

      {/* Test Plan Result */}
      {testPlan && (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6 mb-6">
          <strong>AI-Generated Test Plan:</strong>
          <div className="mt-2 whitespace-pre-line">{testPlan}</div>
        </div>
      )}

      {/* Test Data Result */}
      {testData && (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6 mb-6">
          <strong>AI-Generated Test Data:</strong>
          <div className="mt-2 whitespace-pre-line">{testData}</div>
          <button
            type="button"
            className="mt-4 bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
            onClick={() => {
              const blob = new Blob([testData], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'test-data.txt';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            Download Test Data
          </button>
        </div>
      )}
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

      {(automationResult || automationScreenshot || automationStatus || automationLogs.length > 0) && (
        <div className="w-full max-w-md bg-white rounded-lg shadow p-6 text-gray-800">
          <strong>Automation Result:</strong>
          {automationStatus && (
            <div className="mt-2 text-sm text-blue-700 font-semibold">Status: {automationStatus}</div>
          )}
          {automationLogs.length > 0 && (
            <div className="mt-2 text-xs bg-gray-100 rounded p-2 max-h-32 overflow-y-auto">
              <strong>Logs:</strong>
              <ul className="list-disc pl-4">
                {automationLogs.map((log, idx) => (
                  <li key={idx}>{log}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-2 whitespace-pre-line">{automationResult}</div>
          {automationScreenshot && (
            <div className="mt-4">
              <strong>Screenshot:</strong>
              <img
                src={`data:image/png;base64,${automationScreenshot}`}
                alt="Automation Screenshot"
                className="mt-2 border rounded max-w-full"
              />
              <button
                type="button"
                className="mt-2 bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = `data:image/png;base64,${automationScreenshot}`;
                  link.download = 'automation-screenshot.png';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                Download Screenshot
              </button>
            </div>
          )}
          <div className="mt-6 flex gap-2">
            <button type="button" className="bg-yellow-500 text-white rounded px-4 py-2 opacity-60 cursor-not-allowed" title="Jira integration available. Configure API to enable." disabled>
              Log Bug to Jira
            </button>
            <button type="button" className="bg-green-600 text-white rounded px-4 py-2 opacity-60 cursor-not-allowed" title="TestRail integration available. Configure API to enable." disabled>
              Push Result to TestRail
            </button>
            <button
              type="button"
              className="bg-gray-400 text-white rounded px-4 py-2 hover:bg-gray-500"
              onClick={() => {
                setAutomationResult("");
                setAutomationScreenshot(null);
                setAutomationStatus("");
                setAutomationLogs([]);
              }}
            >
              Clear Results
            </button>
          </div>
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
