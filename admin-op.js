const API_URL = "https://hospital-server-p4gy.onrender.com";

// ⏰ Live Date & Time (AM/PM)
function updateDateTime() {
  const now = new Date();
  document.getElementById("currentDate").textContent = now.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  document.getElementById("currentTime").textContent = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
setInterval(updateDateTime, 1000);
updateDateTime();

// 📊 Fetch Today's OP Data
async function fetchOPData() {
  try {
    const res = await fetch(`${API_URL}/api/admin/op-bookings`);
    const data = await res.json();
    renderTable(data);
  } catch (err) {
    console.error("❌ Fetch Error:", err);
  }
}

// 🧾 Render Table (Responsive for all screens)
function renderTable(data) {
  const tbody = document.getElementById("opTable");
  tbody.innerHTML = "";

  data.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.classList.add("border-b", "hover:bg-blue-50");

    // Status badge or View button logic
    let statusContent = "";
    const status = item.status || "Pending";

    if (status === "Doctor") {
      statusContent = `<button class="bg-blue-600 text-white px-3 py-1 rounded-md font-medium animate-glow" onclick="toggleOptions('${item._id}', this)">Doctor</button>`;
    } else if (status === "Report") {
      statusContent = `<button class="bg-yellow-500 text-white px-3 py-1 rounded-md font-medium animate-glow" onclick="toggleOptions('${item._id}', this)">Reports</button>`;
    } else if (status === "Completed") {
      statusContent = `<span class="bg-green-600 text-white px-3 py-1 rounded-md font-medium">Completed</span>`;
    } else {
      statusContent = `<button class="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition" onclick="toggleOptions('${item._id}', this)">View</button>`;
    }

    tr.innerHTML = `
      <td class="p-3">${index + 1}</td>
      <td class="p-3">${item.opNumber}</td>
      <td class="p-3">${item.patientName}</td>
      <td class="p-3 text-center">${statusContent}</td>
    `;

    tbody.appendChild(tr);
  });
}

// ⚙️ Show Inline Popup for Status Update
function toggleOptions(id, btn) {
  // Remove existing expanded row
  const existing = document.querySelector(".expand-row");
  if (existing) existing.remove();

  // Lock for Completed
  if (btn.textContent.trim() === "Completed") return;

  // Create new row expansion
  const parentRow = btn.closest("tr");
  const expandRow = document.createElement("tr");
  expandRow.className = "expand-row slide-down bg-gray-50";

  expandRow.innerHTML = `
    <td colspan="4" class="p-4 text-center space-x-2">
      <button onclick="updateStatus('${id}', 'Doctor')" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Doctor</button>
      <button onclick="updateStatus('${id}', 'Report')" class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">Reports</button>
      <button onclick="updateStatus('${id}', 'Completed')" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Completed</button>
    </td>
  `;

  parentRow.insertAdjacentElement("afterend", expandRow);
}

// 🧠 Update Status in Backend
async function updateStatus(id, status) {
  try {
    const res = await fetch(`${API_URL}/api/admin/update-status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      console.log(`✅ Updated to ${status}`);
      fetchOPData(); // refresh
    } else {
      console.error("❌ Update failed");
    }
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

// 🔁 Auto-refresh every 10s
setInterval(fetchOPData, 10000);
fetchOPData();

// ✨ Status Glow Animation
const style = document.createElement("style");
style.innerHTML = `
  @keyframes glow {
    0% { box-shadow: 0 0 0px rgba(0,0,0,0); }
    50% { box-shadow: 0 0 10px rgba(59,130,246,0.6); }
    100% { box-shadow: 0 0 0px rgba(0,0,0,0); }
  }
  .animate-glow {
    animation: glow 1.2s ease-in-out;
  }
`;
document.head.appendChild(style);
