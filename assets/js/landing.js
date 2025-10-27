const API_URL = "http://localhost:5000";

const translations = {
  te: {
    title: "అశ్విని న్యూరో సెంటర్",
    consulting: "ప్రస్తుతం కన్సల్టింగ్",
    doctorLabel: "వైద్యుడు:",
    patientLabel: "రోగి:",
    nextLabel: "తదుపరి క్యూలో:",
    total: "మొత్తం రోగులు:",
    track: "నా ఓపి స్థితిని ట్రాక్ చేయండి"
  },
  en: {
    title: "Ashwini Neuro Center",
    consulting: "Now Consulting",
    doctorLabel: "Doctor:",
    patientLabel: "Patient:",
    nextLabel: "Next in Queue:",
    total: "Total Patients:",
    track: "Track My OP Status"
  }
};
function showLiveDateTime() {
  const el = document.getElementById("currentDateTime");
  if (!el) return;
  setInterval(() => {
    const now = new Date();
    const formatted = now.toLocaleString("te-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    el.textContent = formatted;
  }, 1000);
}
document.addEventListener("DOMContentLoaded", showLiveDateTime);

// // ✅ Helper to translate English text → Telugu
// async function translateToTelugu(text) {
//   if (!text || text === "—") return text;
//   try {
//     const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|te`);
//     const data = await res.json();
//     return data.responseData.translatedText || text;
//   } catch (e) {
//     console.error("Translation error:", e);
//     return text;
//   }  
// }

function handleEmergencyClick() {
  window.location.href = "emergency.html";
}

// ✅ Fetch + Auto Translate if Telugu selected
async function fetchConsultingData() {
  try {
    const [consultingRes, nextRes, allRes] = await Promise.all([
      fetch(`${API_URL}/api/current-consulting`),
      fetch(`${API_URL}/api/next-in-queue`),
      fetch(`${API_URL}/api/getOPs`)
    ]);

    const consulting = await consultingRes.json();
    const next = await nextRes.json();
    const all = await allRes.json();

    const lang = localStorage.getItem("userLang") || "te";
    const t = translations[lang];

    let doctorName = consulting?.doctorName || "—";
    let patientName = consulting?.patientName || "—";
    let nextPatientName = next?.patientName || "—";

    if (lang === "te") {
      doctorName = await translateToTelugu(doctorName);
      patientName = await translateToTelugu(patientName);
      nextPatientName = await translateToTelugu(nextPatientName);
    }

    document.getElementById("title").textContent = t.title;
    document.getElementById("consultingTitle").textContent = t.consulting;
    document.getElementById("nextLabel").textContent = t.nextLabel;
    document.getElementById("trackButton").textContent = t.track;

    document.getElementById("nowDoctor").textContent = `${t.doctorLabel} ${doctorName}`;
    document.getElementById("nowPatient").textContent = `${t.patientLabel} ${patientName}`;
    document.getElementById("nextPatient").textContent = nextPatientName;
    document.getElementById("totalPatients").textContent = `${t.total} ${all.length}`;
  } catch (err) {
    console.error("Queue Fetch Error:", err);
  }
}

// 🔁 Refresh every 5 seconds
setInterval(fetchConsultingData, 5000);
fetchConsultingData();

// 🌐 Language Switch
const langSelect = document.getElementById("langSelect");
const savedLang = localStorage.getItem("userLang") || "te";
langSelect.value = savedLang;

langSelect.addEventListener("change", e => {
  const lang = e.target.value;
  localStorage.setItem("userLang", lang);
  fetchConsultingData();
});
