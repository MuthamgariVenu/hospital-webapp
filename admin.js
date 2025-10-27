const API_URL = "https://hospital-server-p4gy.onrender.com";

// ⏰ Update current date & time
function updateDateTime() {
  const now = new Date();
  document.getElementById("currentDate").textContent = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
  document.getElementById("currentTime").textContent = now.toLocaleTimeString("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true
});

}
setInterval(updateDateTime, 1000);
updateDateTime();

// 📊 Fetch dashboard counts
async function fetchDashboardCounts() {
  try {
    const res = await fetch(`${API_URL}/api/admin/dashboard-counts`);
    const data = await res.json();

    document.getElementById("totalOPs").textContent = data.totalCount ?? "--";
    document.getElementById("reportCount").textContent = data.reportCount ?? "--";
    document.getElementById("completedCount").textContent = data.completedCount ?? "--";
  } catch (err) {
    console.error("❌ Dashboard Fetch Error:", err);
  }
}

// 🔁 Auto refresh every 10 seconds
setInterval(fetchDashboardCounts, 10000);
fetchDashboardCounts();

// 🧭 Navigation
function navigateTo(page) {
  window.location.href = page;
}
