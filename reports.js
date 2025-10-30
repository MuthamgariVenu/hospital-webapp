// ✅ Backend base URL
const API_BASE = "http://localhost:5000/api/reports";

// ✅ Load all reports
async function loadReports() {
  try {
    const res = await fetch(`${API_BASE}/list`);
    const data = await res.json();

    const reports = data.reports || [];

    // Update count cards
    const totalReports = reports.length;
    const completed = reports.filter(r => r.status === "Ready").length;

    document.getElementById("reportCount").innerText = totalReports;
    document.getElementById("completedCount").innerText = completed;

    // Populate table
    const tableBody = document.getElementById("reportTableBody");
    tableBody.innerHTML = "";

    if (reports.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:gray;">No Reports Found</td></tr>`;
      return;
    }

    reports.forEach((item, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${item.opNumber || item.opNo}</td>
        <td>${item.patientName}</td>
        <td>
          <button class="view-btn" onclick="openActions('${item.opNumber}','${item.patientName}','${item.patientNumber}','${item.status}')">
            ${item.status}
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (err) {
    console.error("❌ Fetch Error:", err);
  }
}

// ✅ Open popup with actions
function openActions(opNo, name, mobile, status) {
  const modal = document.createElement("div");
  modal.classList.add("popup");
  modal.innerHTML = `
    <div class="popup-content">
      <h3>${name}</h3>
      <p><b>OP No:</b> ${opNo}</p>
      <p><b>Mobile:</b> ${mobile}</p>
      <div class="action-btns">
        <button class="btn-paid" onclick="updateStatus('${opNo}','${name}','${mobile}','Paid')">Paid</button>
        <button class="btn-ready" onclick="updateStatus('${opNo}','${name}','${mobile}','Ready')">Ready</button>
      </div>
      <button class="close-btn" onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
}

// ✅ Update status + send SMS if Ready
async function updateStatus(opNo, name, mobile, status) {
  try {
    const res = await fetch(`${API_BASE}/updateStatus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opNo, name, mobile, status }),
    });

    const result = await res.json();
    if (result.success) {
      alert(`${status === "Ready" ? "SMS sent to patient!" : "Status updated successfully!"}`);
      loadReports();
      document.querySelector(".popup")?.remove();
    } else {
      alert("Failed to update status.");
    }
  } catch (err) {
    console.error("❌ Update Error:", err);
  }
}

// ✅ Auto-load when page opens
document.addEventListener("DOMContentLoaded", loadReports);
