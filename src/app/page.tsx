  // Handle requirements form submission (generate test cases)
  const handleRequirements = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!requirements.trim()) return;
    setLoading(true);
    setTestCases([]);
    try {
      const res = await fetch("/api/generate-test-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements })
      });
      const data = await res.json();
      setTestCases(data.testCases || []);
    } catch {
      setTestCases([]);
    }
    setLoading(false);
  };

  // Handle test data generation (stub)
  const handleGenerateTestData = async () => {
    setLoading(true);
    setTestData("");
    try {
      const res = await fetch("/api/generate-test-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirements, mask: testDataMask })
      });
      const data = await res.json();
      setTestData(data.testData || "");
    } catch {
      setTestData("");
    }
    setLoading(false);
  };

  // Handle chatbot (stub)
  const handleChat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatLoading(true);
    setChatHistory(h => [...h, { role: "user", content: chatInput }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await res.json();
      setChatHistory(h => [...h, { role: "assistant", content: data.reply || data.error || "No reply." }]);
    } catch {
      setChatHistory(h => [...h, { role: "assistant", content: "Error: Could not get reply." }]);
    }
    setChatInput("");
    setChatLoading(false);
  };
  // Test Run History & Filtering state
  const [testRuns, setTestRuns] = useState([]);
  const [runLoading, setRunLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTestName, setFilterTestName] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const fetchTestRuns = async () => {
    setRunLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.append("status", filterStatus);
    if (filterTestName) params.append("testName", filterTestName);
    if (filterDateFrom) params.append("dateFrom", filterDateFrom);
    if (filterDateTo) params.append("dateTo", filterDateTo);
    try {
      const res = await fetch(`/api/test-run-history?${params.toString()}`);
      const data = await res.json();
      setTestRuns(data.testRuns || []);
    } catch {
      setTestRuns([]);
    }
    setRunLoading(false);
  };
  React.useEffect(() => { fetchTestRuns(); }, []);

  // ...existing code...

  // Place this inside the main return of Home, after the opening <div>:
  // {/* Test Run History & Filtering Dashboard */}

  // ...existing code...
  // ...existing code...

  // Place this inside the main return of Home, after the test run history dashboard:
  // {/* Visual Regression Baseline Dashboard */}

  // ...existing code...
        <div className="flex items-center justify-between mb-2">
          <strong>Visual Regression Baselines</strong>
          <button onClick={fetchBaselines} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">Refresh</button>
        </div>
        {baselineLoading ? (
          <div>Loading baselines...</div>
        ) : baselines.length === 0 ? (
          <div className="text-gray-500">No baselines found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {baselines.map(b => (
              <div key={b.testName} className="border rounded p-2 flex flex-col items-center">
                <div className="text-xs font-mono break-all mb-1">{b.testName}</div>
                <img src={`data:image/png;base64,${b.imageBase64}`} alt={b.testName} className="w-full h-24 object-contain border mb-2" />
                <button onClick={() => handleDeleteBaseline(b.testName)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete Baseline</button>
              </div>
            ))}
          </div>
        )}
      </div>
  // Plain English Test Authoring state
  const [plainEnglishSteps, setPlainEnglishSteps] = useState("");
  const [generatedPlaywright, setGeneratedPlaywright] = useState("");
  const [plainGenLoading, setPlainGenLoading] = useState(false);
  const [plainRunResult, setPlainRunResult] = useState("");
  const [plainVisualResult, setPlainVisualResult] = useState<string | null>(null);
  const [plainVisualDiff, setPlainVisualDiff] = useState<string | null>(null);

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
    setPlainVisualResult(null);
    setPlainVisualDiff(null);
    try {
      // Prompt for test name (or use timestamp)
      const testName = `plain-english-test-${Date.now()}`;
      const res = await fetch("/api/run-playwright-code/route-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: generatedPlaywright, testName })
      });
      const data = await res.json();
      setPlainRunResult(data.result || data.error || "No result.");
      setPlainVisualResult(data.visualResult || null);
      setPlainVisualDiff(data.diff || null);
    } catch (err) {
      setPlainRunResult("Error: Could not run code.");
      setPlainVisualResult(null);
      setPlainVisualDiff(null);
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

      <div className="flex gap-2 mt-2">
        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleApprove} disabled={status==='Approved'}>Approve as Baseline</button>
        <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={handleReject} disabled={status==='Rejected'}>Reject</button>
      </div>
      {history.length > 0 && (
        <div className="mt-2 text-xs bg-gray-50 rounded p-2">
          <strong>Review History:</strong>
          <ul>
            {history.map((h,i)=>(<li key={i}>{h.date}: <span className={h.status==='Approved'?'text-green-700':'text-red-700'}>{h.status}</span> {h.comment && `- ${h.comment}`}</li>))}
          </ul>
        </div>
      )}
    </div>
  );
}
          </div>
        )}
      </div>

"use client";
import React, { useState, FormEvent, ChangeEvent } from "react";


export default function Home() {
  // ...existing code...

  // Move all dashboard state/hooks to the top of Home
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [runLoading, setRunLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterTestName, setFilterTestName] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const fetchTestRuns = async () => {
    setRunLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.append("status", filterStatus);
    if (filterTestName) params.append("testName", filterTestName);
    if (filterDateFrom) params.append("dateFrom", filterDateFrom);
    if (filterDateTo) params.append("dateTo", filterDateTo);
    try {
      const res = await fetch(`/api/test-run-history?${params.toString()}`);
      const data = await res.json();
      setTestRuns(data.testRuns || []);
    } catch {
      setTestRuns([]);
    }
    setRunLoading(false);
  };
  React.useEffect(() => { fetchTestRuns(); }, []);

  // Visual Regression Baseline Dashboard state/hooks
  const [baselines, setBaselines] = useState<{ testName: string; imageBase64: string }[]>([]);
  const [baselineLoading, setBaselineLoading] = useState(false);
  const fetchBaselines = async () => {
    setBaselineLoading(true);
    try {
      const res = await fetch("/api/visual-regression/baselines");
      const data = await res.json();
      setBaselines(data.baselines || []);
    } catch {
      setBaselines([]);
    }
    setBaselineLoading(false);
  };
  const handleDeleteBaseline = async (testName: string) => {
    if (!window.confirm(`Delete baseline for ${testName}?`)) return;
    await fetch("/api/visual-regression/baselines", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testName })
    });
    fetchBaselines();
  };
  React.useEffect(() => { fetchBaselines(); }, []);

  // ...existing code...

  // --- Place all dashboard JSX inside the main return of Home ---
  // (1) Test Run History & Filtering Dashboard
  // (2) Visual Regression Baseline Dashboard

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      {/* Test Run History & Filtering Dashboard */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <strong className="text-lg">Test Run History</strong>
          <select className="border rounded px-2 py-1" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="visual-diff">Visual Diff</option>
          </select>
          <input type="text" className="border rounded px-2 py-1" placeholder="Test Name" value={filterTestName} onChange={e => setFilterTestName(e.target.value)} />
          <input type="date" className="border rounded px-2 py-1" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} />
          <input type="date" className="border rounded px-2 py-1" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} />
          <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={fetchTestRuns}>Filter</button>
          <button className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" onClick={() => { setFilterStatus(""); setFilterTestName(""); setFilterDateFrom(""); setFilterDateTo(""); fetchTestRuns(); }}>Clear</button>
        </div>
        {runLoading ? (
          <div>Loading test runs...</div>
        ) : testRuns.length === 0 ? (
          <div className="text-gray-500">No test runs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-1 border">Date</th>
                  <th className="px-2 py-1 border">Test Name</th>
                  <th className="px-2 py-1 border">Status</th>
                  <th className="px-2 py-1 border">Bugs</th>
                  <th className="px-2 py-1 border">Coverage (%)</th>
                </tr>
              </thead>
              <tbody>
                {testRuns.map((run, i) => (
                  <tr key={run.id || i} className="border-b">
                    <td className="px-2 py-1 border">{run.executedAt ? new Date(run.executedAt).toLocaleString() : "-"}</td>
                    <td className="px-2 py-1 border font-mono">{run.testName || "-"}</td>
                    <td className="px-2 py-1 border">
                      <span className={`px-2 py-1 rounded text-xs ${run.status === 'passed' ? 'bg-green-100 text-green-800' : run.status === 'failed' ? 'bg-red-100 text-red-800' : run.status === 'visual-diff' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{run.status}</span>
                    </td>
                    <td className="px-2 py-1 border text-center">{run.bugCount}</td>
                    <td className="px-2 py-1 border text-center">{run.coverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Visual Regression Baseline Dashboard */}
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <strong>Visual Regression Baselines</strong>
          <button onClick={fetchBaselines} className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">Refresh</button>
        </div>
        {baselineLoading ? (
          <div>Loading baselines...</div>
        ) : baselines.length === 0 ? (
          <div className="text-gray-500">No baselines found.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {baselines.map(b => (
              <div key={b.testName} className="border rounded p-2 flex flex-col items-center">
                <div className="text-xs font-mono break-all mb-1">{b.testName}</div>
                <img src={`data:image/png;base64,${b.imageBase64}`} alt={b.testName} className="w-full h-24 object-contain border mb-2" />
                <button onClick={() => handleDeleteBaseline(b.testName)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Delete Baseline</button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* ...existing code for the rest of the dashboard... */}
    </div>
  );
  async function handleApprove() {
    await fetch("/api/visual-regression", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testName: testName, screenshotBase64: newImg })
    });
    setStatus('Approved');
    setHistory(function(h){ return [{status:'Approved',comment:comment,date:(new Date()).toLocaleString()}].concat(h); });
    alert("Baseline updated. Future runs will compare to this image.");
  }
  function handleReject() {
    setStatus('Rejected');
    setHistory(function(h){ return [{status:'Rejected',comment:comment,date:(new Date()).toLocaleString()}].concat(h); });
    alert("Change rejected. Please investigate the difference.");
  }

  return (
    <div className="mt-2 border rounded p-2">
      <div className="flex gap-2 mb-2">
        <button className={`px-2 py-1 rounded ${show==='diff'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={function(){setShow('diff')}}>Diff</button>
        <button className={`px-2 py-1 rounded ${show==='baseline'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={function(){setShow('baseline')}}>Baseline</button>
        <button className={`px-2 py-1 rounded ${show==='new'?'bg-blue-600 text-white':'bg-gray-200'}`} onClick={function(){setShow('new')}}>New Screenshot</button>
        <span className={`ml-auto px-2 py-1 rounded text-xs ${status==='Pending'?'bg-yellow-200 text-yellow-800':status==='Approved'?'bg-green-200 text-green-800':'bg-red-200 text-red-800'}`}>{status}</span>
      </div>
      <div className="flex gap-4 items-center">
        {show==='diff' && <img src={`data:image/png;base64,${diffBase64}`} alt="Diff" className="w-48 border" />}
        {show==='baseline' && baselineImg && <img src={`data:image/png;base64,${baselineImg}`} alt="Baseline" className="w-48 border" />}
        {show==='new' && newImg && <img src={`data:image/png;base64,${newImg}`} alt="New Screenshot" className="w-48 border" />}
      </div>
      {commentBox && (
        <div className="mt-2">
          <textarea className="border rounded w-full p-1 text-xs" placeholder="Leave a review comment..." value={comment} onChange={function(e){setComment(e.target.value)}} />
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleApprove} disabled={status==='Approved'}>Approve as Baseline</button>
        <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={handleReject} disabled={status==='Rejected'}>Reject</button>
      </div>
      {history.length > 0 && (
        <div className="mt-2 text-xs bg-gray-50 rounded p-2">
          <strong>Review History:</strong>
          <ul>
            {history.map(function(h,i){return (<li key={i}>{h.date}: <span className={h.status==='Approved'?'text-green-700':'text-red-700'}>{h.status}</span> {h.comment && `- ${h.comment}`}</li>);})}
          </ul>
        </div>
      )}
    </div>
  );
}
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
