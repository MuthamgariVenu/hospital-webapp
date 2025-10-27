const apiBase = "http://localhost:5000/api/admin";

// 🗓️ Helper: Format Date to Indian (DD-MM-YYYY)
function formatIndianDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// ⏰ Helper: Format Time to Indian 12-hour format (AM/PM)
function formatIndianTime(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata", // ✅ Ensures accurate IST
  });
}

// ✅ Show Today's Date in Header
document.getElementById("todayDate").textContent = formatIndianDate(new Date());

// ✅ Load Dashboard Counts
async function loadDashboardCounts() {
  try {
    const res = await fetch(`${apiBase}/dashboard-counts`);
    const data = await res.json();

    document.getElementById("opCount").textContent = data.opCount || 0;
    document.getElementById("reportCount").textContent = data.reportCount || 0;
    document.getElementById("completedCount").textContent = data.completedCount || 0;
  } catch (err) {
    console.error("Count Error:", err);
  }
}

// ✅ Load OP Booking Details (FIFO + Today Only + IST)
async function loadOpBookings() {
  const tbody = document.getElementById("opTableBody");

  try {
    const res = await fetch(`${apiBase}/op-bookings`);
    const data = await res.json();

    // ✅ Filter only today's bookings
    const todayISO = new Date().toISOString().split("T")[0];
    const todaysData = data.filter((op) => {
      const opDate = new Date(op.date).toISOString().split("T")[0];
      return opDate === todayISO;
    });

    // ✅ FIFO Sort (first booked first)
    const fifoData = todaysData.sort((a, b) => {
      const aTime = new Date(a.createdAt || a.date);
      const bTime = new Date(b.createdAt || b.date);
      return aTime - bTime;
    });

    // ✅ If no data
    if (!fifoData.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center p-3 text-gray-400">
            No bookings for today
          </td>
        </tr>`;
      return;
    }

    // ✅ Render rows
    tbody.innerHTML = fifoData
      .map((op, index) => {
        const formattedDate = formatIndianDate(op.date);
        const formattedTime = formatIndianTime(op.date);

        let badgeHTML = "";
        if (op.status === "Completed") {
          badgeHTML = `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium cursor-not-allowed">✅ Completed</span>`;
        } else if (op.status === "Doctor") {
          badgeHTML = `<span onclick="toggleActions('${op._id}')"
            class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-green-200 transition">🩺 Doctor</span>`;
        } else if (op.status === "Report") {
          badgeHTML = `<span onclick="toggleActions('${op._id}')"
            class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-yellow-200 transition">🧾 Report</span>`;
        } else {
          badgeHTML = `<button onclick="toggleActions('${op._id}')"
            class="bg-blue-500 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-600">View</button>`;
        }

        return `
          <tr class="border-b hover:bg-gray-50 transition">
            <td class="p-2">${index + 1}</td>
            <td class="p-2 font-medium text-gray-700">${op.patientName || "Unknown"}</td>
            <td class="p-2">${formattedTime}</td>
            <td class="p-2">${formattedDate}</td>
            <td class="p-2 text-center" id="cell-${op._id}">${badgeHTML}</td>
          </tr>
          <tr id="actions-${op._id}" class="hidden bg-gray-50">
            <td colspan="5" class="p-3 text-center">
              <span class="text-sm font-semibold text-gray-700">
                Update ${op.patientName}
              </span>
              <div class="mt-2 flex justify-center space-x-2">
                <button onclick="updateStatus('${op._id}', 'Doctor')" class="bg-green-500 text-white px-3 py-1 rounded-md text-xs hover:bg-green-600">Doctor</button>
                <button onclick="updateStatus('${op._id}', 'Report')" class="bg-yellow-500 text-white px-3 py-1 rounded-md text-xs hover:bg-yellow-600">Report</button>
                <button onclick="updateStatus('${op._id}', 'Completed')" class="bg-blue-600 text-white px-3 py-1 rounded-md text-xs hover:bg-blue-700">Completed</button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center p-3 text-red-500">
          Error loading data
        </td>
      </tr>`;
  }
}

// ✅ Toggle Actions (Expand/Collapse Update Buttons)
function toggleActions(id) {
  const row = document.getElementById(`actions-${id}`);
  if (row) row.classList.toggle("hidden");
}

// ✅ Update Status in Backend
async function updateStatus(id, status) {
  try {
    await fetch(`${apiBase}/update-status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    const cell = document.getElementById(`cell-${id}`);
    let newBadge = "";

    if (status === "Doctor") {
      newBadge = `<span onclick="toggleActions('${id}')"
        class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-green-200 transition">🩺 Doctor</span>`;
    } else if (status === "Report") {
      newBadge = `<span onclick="toggleActions('${id}')"
        class="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:bg-yellow-200 transition">🧾 Report</span>`;
    } else if (status === "Completed") {
      newBadge = `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium cursor-not-allowed">✅ Completed</span>`;
    }

    cell.innerHTML = newBadge;
    document.getElementById(`actions-${id}`).classList.add("hidden");
    loadDashboardCounts(); // refresh counts after update
  } catch (err) {
    console.error("Update Error:", err);
    alert("Error updating status");
  }
}

// ✅ Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ✅ Initialize Dashboard
loadDashboardCounts();
loadOpBookings();
