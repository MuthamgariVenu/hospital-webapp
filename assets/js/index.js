// ======================================================
// 🏥 Ashwini Neuro Center - Live Dashboard Script
// ======================================================

// --- bilingual translations ---
const langData = {
  en: {
    totalOp: "Total OP Count",
    firstConsult: "1st Consultation Done",
    secondConsult: "2nd Consultation Done",
    nowConsulting: "Now Consulting",
    doctor: "Doctor:",
    patient: "Patient:",
    nextQueue: "Next in Queue:",
    trackBtn: "Track My OP Status"
  },
  te: {
    totalOp: "మొత్తం ఓపీ సంఖ్య",
    firstConsult: "మొదటి కన్సల్టేషన్ పూర్తైంది",
    secondConsult: "రెండవ కన్సల్టేషన్ పూర్తైంది",
    nowConsulting: "ప్రస్తుతం కన్సల్టింగ్ చేస్తున్నారు",
    doctor: "వైద్యుడు:",
    patient: "రోగి:",
    nextQueue: "తదుపరి రోగి:",
    trackBtn: "నా ఓపీ స్థితి తెలుసుకోండి"
  }
};

// ======================================================
// 🔹 Fetch Live Data from Backend (MongoDB)
// ======================================================

const API_BASE = "http://localhost:5000/api"; // change later when deployed

async function loadDashboardData() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
    const data = await res.json();

    document.getElementById("opCount").textContent = data.total || 0;
    document.getElementById("firstConsult").textContent = data.first || 0;
    document.getElementById("secondConsult").textContent = data.second || 0;
  } catch (err) {
    console.error("Error fetching stats:", err);
  }
}

async function loadCurrentConsulting() {
  try {
    const res = await fetch(`${API_BASE}/getOPs`);
    const patients = await res.json();

    if (patients.length > 0) {
      const current = patients[patients.length - 1];
      const next = patients[patients.length - 2] || {};

      document.getElementById("currentDoctor").textContent = current.doctorName || "—";
      document.getElementById("currentPatient").textContent = current.patientName || "—";
      document.getElementById("currentOp").textContent = current.opNumber || "—";
      document.getElementById("nextPatient").textContent = next.patientName || "—";
      document.getElementById("nextOp").textContent = next.opNumber || "—";
    }
  } catch (err) {
    console.error("Error fetching current consulting:", err);
  }
}

// ======================================================
// 🔹 Language Switch & OP Tracking
// ======================================================
function switchLanguage(lang) {
  const t = langData[lang];
  document.getElementById("lblTotalOp").textContent = t.totalOp;
  document.getElementById("lblFirstConsult").textContent = t.firstConsult;
  document.getElementById("lblSecondConsult").textContent = t.secondConsult;
  document.getElementById("lblNowConsulting").textContent = t.nowConsulting;
  document.getElementById("lblDoctor").textContent = t.doctor;
  document.getElementById("lblPatient").textContent = t.patient;
  document.getElementById("lblNextQueue").textContent = t.nextQueue;
  document.getElementById("trackOpBtn").textContent = t.trackBtn;
}

document.getElementById("lang").addEventListener("change", (e) => {
  switchLanguage(e.target.value);
});

document.getElementById("trackOpBtn").addEventListener("click", async () => {
  const op = prompt("Enter your OP Number to check status:");
  if (!op) return;
  try {
    const res = await fetch(`${API_BASE}/getOPs`);
    const patients = await res.json();
    const found = patients.find(p => p.opNumber === op);
    if (!found) {
      alert("❌ OP not found or completed.");
    } else {
      alert(`✅ ${found.patientName} is currently "${found.status}" with ${found.doctorName}.`);
    }
  } catch (err) {
    alert("Server not reachable.");
  }
});

// ======================================================
// 🔹 Initialize Dashboard
// ======================================================
function initDashboard() {
  loadDashboardData();
  loadCurrentConsulting();
  setInterval(() => {
    loadDashboardData();
    loadCurrentConsulting();
  }, 30000);
}

window.addEventListener("DOMContentLoaded", initDashboard);
