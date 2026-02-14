document.addEventListener("DOMContentLoaded", function () {

  /* =========================
     SAFE GETTER
  ========================== */
  const $ = (id) => document.getElementById(id);

  function parseAmount(value) {
    if (!value) return 0;
    return Number(String(value).replace(/[^\d.-]/g, "")) || 0;
  }

  /* =========================
     TAB SYSTEM FIXED
  ========================== */
  window.showTab = function (id) {
    document.querySelectorAll(".tab").forEach(tab => {
      tab.style.display = "none";
    });

    const activeTab = $(id);
    if (activeTab) activeTab.style.display = "block";
  };

  /* =========================
     SHARE APP
  ========================== */
  window.shareApp = function () {
    const url = window.location.origin;

    if (navigator.share) {
      navigator.share({
        title: "Ghar Manager",
        text: "Check out my Ghar Manager App 🔥",
        url
      }).catch(() => {});
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(url));
    }
  };

  /* =========================
     DATA LOAD
  ========================== */
  let kitchenData = JSON.parse(localStorage.getItem("kitchenData")) || [];
  let tempItems = [];

  /* =========================
     PDF EXPORT
  ========================== */
  $("pdfBtn")?.addEventListener("click", async function () {

    const rows = document.querySelectorAll("#kitchenTable tr");
    if (!rows.length) return alert("No data available!");

    const invoice = $("invoiceTemplate");
    if (!invoice) return;

    const tbody = invoice.querySelector("tbody");
    if (!tbody) return;

    tbody.innerHTML = "";
    let grandTotal = 0;

    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length < 3) return;

      const date = cols[0].innerText;
      const items = cols[1].innerText;
      const total = cols[2].innerText;

      const amount = parseAmount(total);
      grandTotal += amount;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="border:1px solid #ccc;padding:6px;">${date}</td>
        <td style="border:1px solid #ccc;padding:6px;">${items}</td>
        <td style="border:1px solid #ccc;padding:6px;color:red;">₹ ${amount}</td>
      `;
      tbody.appendChild(tr);
    });

    if ($("invoiceDate"))
      $("invoiceDate").innerText = "Generated: " + new Date().toLocaleString();

    if ($("invoiceGrandTotal"))
      $("invoiceGrandTotal").innerText = "Grand Total: ₹ " + grandTotal;

    await new Promise(r => setTimeout(r, 300));

    const canvas = await html2canvas(invoice, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    doc.save("Ghar_Manager_Invoice.pdf");
  });

  /* =========================
     IMAGE EXPORT
  ========================== */
  $("imgBtn")?.addEventListener("click", async function () {

    const table = $("kitchenTable");
    if (!table || table.innerHTML.trim() === "")
      return alert("No data to capture!");

    await new Promise(r => setTimeout(r, 200));

    const canvas = await html2canvas(table, { scale: 2 });

    const link = document.createElement("a");
    link.download = "Kitchen_Table.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  /* =========================
     WHATSAPP SHARE
  ========================== */
  window.shareTable = function () {

    const rows = document.querySelectorAll("#kitchenTable tr");
    if (!rows.length) return alert("No data to share!");

    let totalAmount = 0;
    let message =
"━━━━━━━━━━━━━━━━━━━━\n🏠 *GHAR MANAGER*\n🍳 *Kitchen Report*\n━━━━━━━━━━━━━━━━━━━━\n\n";

    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length < 3) return;

      const date = cols[0].innerText;
      const items = cols[1].innerText;
      const total = cols[2].innerText;

      const amount = parseAmount(total);
      totalAmount += amount;

      message +=
`📅 ${date}
🛒 ${items}
💰 ₹ ${amount}
──────────────────\n\n`;
    });

    message += `💎 Grand Total: ₹ ${totalAmount}`;

    const url =
      /Android|iPhone/i.test(navigator.userAgent)
        ? `https://wa.me/?text=${encodeURIComponent(message)}`
        : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  /* =========================
     SAVE ENTRY
  ========================== */
  window.saveKitchenEntry = function () {

    const total = parseAmount($("totalAmount")?.value);
    if (!tempItems.length) return alert("Add items first!");

    kitchenData.push({
      date: new Date().toISOString(),
      items: [...tempItems],
      total
    });

    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));
    tempItems = [];

    renderKitchen();
  };

  /* =========================
     RENDER TABLE
  ========================== */
  function renderKitchen() {

    const table = $("kitchenTable");
    if (!table) return;

    table.innerHTML = kitchenData.map((entry, index) => `
      <tr>
        <td>${new Date(entry.date).toLocaleString()}</td>
        <td>${entry.items.join("<br>")}</td>
        <td>₹ ${entry.total}</td>
        <td><button type="button" onclick="deleteEntry(${index})">Delete</button></td>
      </tr>
    `).join("");

    updateSummary();
  }

  window.deleteEntry = function (i) {
    kitchenData.splice(i, 1);
    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));
    renderKitchen();
  };

  function updateSummary() {
    const total = kitchenData.reduce((sum, e) => sum + e.total, 0);

    if ($("grandTotal")) $("grandTotal").innerText = total;
    if ($("kitchenTotal")) $("kitchenTotal").innerText = total;
    if ($("todayTotal")) $("todayTotal").innerText = total;
    if ($("weekTotal")) $("weekTotal").innerText = total;
    if ($("monthTotal")) $("monthTotal").innerText = total;
  }

  /* =========================
     INIT
  ========================== */
  showTab("dashboard");   // default tab
  renderKitchen();

});
