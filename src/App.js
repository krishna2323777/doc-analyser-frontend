import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_KEY
  );

  const [summaries, setSummaries] = useState([]);

  React.useEffect(() => {
    async function fetchSummaries() {
      const { data } = await supabase
        .from("summaries")
        .select("*")
        .order("created_at", { ascending: false });
      setSummaries(data || []);
    }
    fetchSummaries();
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post(
      "https://doc-analyser-backend2.onrender.com/api/analyze",

      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    setResult(data.analysis);
    setLoading(false);
  };

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        background: "#232142",
        color: "#fff",
        padding: 24,
        borderRadius: 12,
      }}
    >
      <h2>AI Document Analyzer</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button
        onClick={handleUpload}
        disabled={loading || !file}
        style={{ marginLeft: 8 }}
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>
      {result && (
        <div style={{ marginTop: 32 }}>
          <div style={{ background: "#2d2a4a", padding: 16, borderRadius: 8 }}>
            <h3>Uploaded Document</h3>
            <div>
              <b>Summary:</b> {result.summary}
            </div>
            <div style={{ marginTop: 16 }}>
              <b>Key Information</b>
              <div>Document Type: {result.documentType}</div>
              <div>Reference Number: {result.referenceNumber}</div>
              <div>Total Due: {result.totalDue}</div>
              <div>Filing Status: {result.filingStatus}</div>
            </div>
            <div style={{ marginTop: 16 }}>
              <b>Important Deadlines</b>
              <ul>
                {result.deadlines &&
                  result.deadlines.map((d, i) => (
                    <li key={i}>
                      {d.type}:{" "}
                      <span style={{ color: "#ff6b81" }}>{d.date}</span>
                    </li>
                  ))}
              </ul>
            </div>
            <div style={{ marginTop: 16 }}>
              <b>Recommendations</b>
              <ul>
                {result.recommendations &&
                  result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </div>
        </div>
      )}
      {/* --- Add All Summaries block here --- */}
      <h2 style={{ marginTop: 40 }}>All Summaries</h2>
      {summaries.map((s) => (
        <div
          key={s.id}
          style={{
            margin: 16,
            padding: 12,
            background: "#2d2a4a",
            borderRadius: 8,
          }}
        >
          <div>
            <b>Filename:</b> {s.filename}
          </div>
          <div>
            <b>Summary:</b> {s.summary}
          </div>
          <div style={{ fontSize: 12, color: "#aaa" }}>
            {new Date(s.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
