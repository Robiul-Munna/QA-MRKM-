"use client";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/metrics")
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">QA Dashboard</h1>
      {loading ? (
        <div className="text-lg">Loading metrics...</div>
      ) : metrics ? (
        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold">{metrics.totalTests}</div>
            <div className="text-gray-600">Total Tests</div>
          </div>
          <div className="bg-green-100 rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-700">{metrics.passed}</div>
            <div className="text-gray-600">Passed</div>
          </div>
          <div className="bg-red-100 rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-red-700">{metrics.failed}</div>
            <div className="text-gray-600">Failed</div>
          </div>
          <div className="bg-yellow-100 rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-yellow-700">{metrics.bugs}</div>
            <div className="text-gray-600">Bugs</div>
          </div>
          <div className="col-span-2 bg-blue-100 rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-700">{metrics.coverage}%</div>
            <div className="text-gray-600">Test Coverage</div>
          </div>
        </div>
      ) : (
        <div className="text-red-600">Failed to load metrics.</div>
      )}
    </div>
  );
}
