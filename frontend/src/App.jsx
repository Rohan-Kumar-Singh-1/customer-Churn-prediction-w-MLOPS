import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const defaultForm = {
  gender: "Male",
  SeniorCitizen: 0,
  Partner: "No",
  Dependents: "No",
  tenure: 12,
  PhoneService: "Yes",
  MultipleLines: "No",
  InternetService: "Fiber optic",
  OnlineSecurity: "No",
  OnlineBackup: "No",
  DeviceProtection: "No",
  TechSupport: "No",
  StreamingTV: "No",
  StreamingMovies: "No",
  Contract: "Month-to-month",
  PaperlessBilling: "Yes",
  PaymentMethod: "Electronic check",
  MonthlyCharges: 70.0,
  TotalCharges: 840.0,
};

const sections = [
  {
    title: "Customer Profile",
    icon: "👤",
    fields: [
      { key: "gender", label: "Gender", type: "select", options: ["Male", "Female"] },
      { key: "SeniorCitizen", label: "Senior Citizen", type: "select", options: [{ value: 0, label: "No" }, { value: 1, label: "Yes" }] },
      { key: "Partner", label: "Partner", type: "select", options: ["Yes", "No"] },
      { key: "Dependents", label: "Dependents", type: "select", options: ["Yes", "No"] },
      { key: "tenure", label: "Tenure (months)", type: "number", min: 0, max: 72 },
    ],
  },
  {
    title: "Phone & Internet",
    icon: "📡",
    fields: [
      { key: "PhoneService", label: "Phone Service", type: "select", options: ["Yes", "No"] },
      { key: "MultipleLines", label: "Multiple Lines", type: "select", options: ["Yes", "No", "No phone service"] },
      { key: "InternetService", label: "Internet Service", type: "select", options: ["DSL", "Fiber optic", "No"] },
    ],
  },
  {
    title: "Online Services",
    icon: "🔒",
    fields: [
      { key: "OnlineSecurity", label: "Online Security", type: "select", options: ["Yes", "No", "No internet service"] },
      { key: "OnlineBackup", label: "Online Backup", type: "select", options: ["Yes", "No", "No internet service"] },
      { key: "DeviceProtection", label: "Device Protection", type: "select", options: ["Yes", "No", "No internet service"] },
      { key: "TechSupport", label: "Tech Support", type: "select", options: ["Yes", "No", "No internet service"] },
      { key: "StreamingTV", label: "Streaming TV", type: "select", options: ["Yes", "No", "No internet service"] },
      { key: "StreamingMovies", label: "Streaming Movies", type: "select", options: ["Yes", "No", "No internet service"] },
    ],
  },
  {
    title: "Billing & Contract",
    icon: "💳",
    fields: [
      { key: "Contract", label: "Contract Type", type: "select", options: ["Month-to-month", "One year", "Two year"] },
      { key: "PaperlessBilling", label: "Paperless Billing", type: "select", options: ["Yes", "No"] },
      {
        key: "PaymentMethod", label: "Payment Method", type: "select",
        options: ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"],
      },
      { key: "MonthlyCharges", label: "Monthly Charges ($)", type: "number", step: 0.01, min: 0 },
      { key: "TotalCharges", label: "Total Charges ($)", type: "number", step: 0.01, min: 0 },
    ],
  },
];

function FullGauge({ prob }) {
  // Sanitize prob to always be a valid number between 0 and 1
  const safeProp = (typeof prob === "number" && !isNaN(prob)) ? Math.min(1, Math.max(0, prob)) : 0;

  const cx = 100;
  const cy = 100;
  const r = 80;

  const angle = safeProp * 360;
  const rad = (angle - 90) * (Math.PI / 180);
  const needleX = cx + r * 0.8 * Math.cos(rad);
  const needleY = cy + r * 0.8 * Math.sin(rad);
  const circumference = 2 * Math.PI * r;

  return (
    <svg viewBox="0 0 200 200" style={{ width: "100%", maxWidth: 240 }}>
      <defs>
        <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r} stroke="#e5e7eb" strokeWidth="12" fill="none" />
      <circle
        cx={cx} cy={cy} r={r}
        stroke="url(#riskGradient)"
        strokeWidth="12" fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={(1 - safeProp) * circumference}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
      <line
        x1={cx} y1={cy}
        x2={needleX} y2={needleY}
        stroke="#111827" strokeWidth="3" strokeLinecap="round"
        style={{ transition: "all 0.8s ease" }}
      />
      <circle cx={cx} cy={cy} r="5" fill="#111827" />
      <text x={cx} y={cy - 10} textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827">
        {(safeProp * 100).toFixed(1)}%
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="#6b7280">
        churn risk
      </text>
    </svg>
  );
}
export default function ChurnPredictor() {
  const [form, setForm] = useState(defaultForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
  setLoading(true);
  setError(null);
  setResult(null);
  try {
    const payload = {
      ...form,
      SeniorCitizen: Number(form.SeniorCitizen),
      tenure: Number(form.tenure),
      MonthlyCharges: parseFloat(form.MonthlyCharges),
      TotalCharges: parseFloat(form.TotalCharges),
    };
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();

    console.log("API RESPONSE:", data);   // 👈 ADD THIS LINE

    setResult(data);
    
    // Validate the response has a valid probability
    if (typeof data.probability !== "number" || isNaN(data.probability)) {
      throw new Error(`Invalid response from server: probability is ${data.probability}`);
    }

    setResult(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
  const getRiskColor = (risk) =>
    risk === "High Risk" ? { bg: "#fef2f2", border: "#fca5a5", text: "#b91c1c", dot: "#ef4444" }
      : { bg: "#f0fdf4", border: "#86efac", text: "#15803d", dot: "#10b981" };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', sans-serif", minHeight: "100vh", background: "#f8f9fb", padding: "0" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f8f9fb; }
        .field-select, .field-input {
          width: 100%; padding: 8px 12px; border: 1.5px solid #e2e8f0; border-radius: 8px;
          background: #fff; font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #1e293b; outline: none; transition: border-color 0.2s;
          appearance: none; -webkit-appearance: none;
        }
        .field-select:focus, .field-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        .field-select { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
        .predict-btn { width: 100%; padding: 14px; background: #4f46e5; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.2s, transform 0.1s; letter-spacing: 0.01em; }
        .predict-btn:hover { background: #4338ca; }
        .predict-btn:active { transform: scale(0.99); }
        .predict-btn:disabled { background: #a5b4fc; cursor: not-allowed; }
        .section-card { background: #fff; border-radius: 14px; border: 1px solid #e8edf3; padding: 20px 22px; margin-bottom: 14px; }
        .field-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; margin-top: 14px; }
        @media (max-width: 500px) { .field-grid { grid-template-columns: 1fr; } .layout { flex-direction: column !important; } }
        .label { font-size: 12px; font-weight: 500; color: #64748b; margin-bottom: 5px; letter-spacing: 0.03em; text-transform: uppercase; }
        .result-pulse { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .spinner { width: 18px; height: 18px; border: 2.5px solid rgba(255,255,255,0.4); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; vertical-align: middle; margin-right: 8px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8edf3", padding: "18px 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.01em" }}>Churn Predictor</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>Telecom Customer Intelligence</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#10b981", fontWeight: 500 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }}></span>
          API Live
        </div>
      </div>

      <div className="layout" style={{ display: "flex", gap: 20, padding: "24px", maxWidth: 1000, margin: "0 auto", alignItems: "flex-start" }}>

        {/* Form */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {sections.map((section) => (
            <div key={section.title} className="section-card">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{section.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{section.title}</span>
              </div>
              <div className="field-grid">
                {section.fields.map((field) => (
                  <div key={field.key}>
                    <div className="label">{field.label}</div>
                    {field.type === "select" ? (
                      <select
                        className="field-select"
                        value={form[field.key]}
                        onChange={(e) => {
                          const v = field.options[0]?.value !== undefined
                            ? e.target.value === "0" || e.target.value === "1" ? Number(e.target.value) : e.target.value
                            : e.target.value;
                          handleChange(field.key, v);
                        }}
                      >
                        {field.options.map((opt) =>
                          typeof opt === "object"
                            ? <option key={opt.value} value={opt.value}>{opt.label}</option>
                            : <option key={opt} value={opt}>{opt}</option>
                        )}
                      </select>
                    ) : (
                      <input
                        className="field-input"
                        type="number"
                        step={field.step || 1}
                        min={field.min ?? 0}
                        max={field.max}
                        value={form[field.key]}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button className="predict-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? <><span className="spinner"></span>Analyzing…</> : "Predict Churn Risk"}
          </button>

          {error && (
            <div style={{ marginTop: 14, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div className="section-card" style={{ position: "sticky", top: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 16 }}>Prediction Result</div>

            {!result && !loading && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#cbd5e1" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>🔮</div>
                <div style={{ fontSize: 13 }}>Fill the form and<br />click predict</div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#a5b4fc" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⚙️</div>
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Running model…</div>
              </div>
            )}

            {result && !loading && (
              <div className="result-pulse">
                {/* Gauge */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <FullGauge prob={result.probability} />
                </div>

                {/* Label Badge */}
                <div style={{ textAlign: "center", marginBottom: 14 }}>
                  <span style={{
                    display: "inline-block", padding: "5px 18px", borderRadius: 20,
                    fontSize: 14, fontWeight: 600,
                    background: result.prediction === 1 ? "#fef2f2" : "#f0fdf4",
                    color: result.prediction === 1 ? "#b91c1c" : "#15803d",
                    border: `1px solid ${result.prediction === 1 ? "#fca5a5" : "#86efac"}`
                  }}>
                    {result.label}
                  </span>
                </div>

                {/* Risk Level */}
                {(() => {
                  const c = getRiskColor(result.risk_level);
                  return (
                    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.dot, flexShrink: 0 }}></span>
                      <div>
                        <div style={{ fontSize: 11, color: c.text, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Risk Level</div>
                        <div style={{ fontSize: 14, color: c.text, fontWeight: 600 }}>{result.risk_level}</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Stat rows */}
                <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
                  {[
                    { label: "Raw Probability", value: `${(result.probability * 100).toFixed(2)}%` },
                    { label: "Model Decision", value: result.prediction === 1 ? "Churn" : "Retain" },
                    { label: "Threshold", value: "60%" },
                  ].map((row) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>{row.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#334155", fontFamily: "'DM Mono', monospace" }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
                  {result.prediction === 1
                    ? "⚠ This customer shows elevated churn signals. Consider a retention offer."
                    : "✓ Customer appears stable. Continue standard engagement."}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
