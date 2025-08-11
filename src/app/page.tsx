

"use client";
import { useState } from "react";

export default function Home() {
  const [requirements, setRequirements] = useState("");
  const [testCases, setTestCases] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [qaReport, setQaReport] = useState("");
  const [loading, setLoading] = useState(false);

  // Simulate AI test case generation
  const handleRequirements = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTestCases([]);
    setQaReport("");
    setTimeout(() => {
      // Simple mock: split requirements into test cases
      const cases = requirements
        .split("\n")
        .filter(line => line.trim())
        .map((line, i) => `Test Case ${i + 1}: Validate "${line.trim()}"`);
      setTestCases(cases);
      setLoading(false);
    }, 1200);
  };

  // Simulate code upload and QA
  const handleFile = async (e: React.FormEvent) => {
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
        <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50" disabled={loading}>
          Generate Test Cases
        </button>
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

      {/* Loading indicator */}
      {loading && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-20 z-50">
          <div className="bg-white rounded-lg shadow p-6 text-lg font-semibold">AI is working...</div>
        </div>
      )}
    </div>
  );
}
