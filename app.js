document.addEventListener("DOMContentLoaded", function () {

  /* =========================
     SAFE ELEMENT GETTER
  ========================== */
  const $ = (id) => document.getElementById(id);

  /* =========================
     SAFE NUMBER PARSER
  ========================== */
  function parseAmount(value) {
    if (!value) return 0;
    return Number(String(value).replace(/[^\d.-]/g, "")) || 0;
  }

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
     DATA LOAD SAFE
  ========================== */
  let kitchenData = JSON.parse(localStorage.getItem("kitchenData")) || [];
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let market = JSON.parse(localStorage.getItem("market")) || [];
  let tempItems = [];

  /* =========================
     PDF EXPORT FIXED
  ========================== */
  $("pdfBtn")?.addEventListener("click", async function () {

    const rows = document.querySelectorAll("#kitchenTable tr");

    if (!rows.length) {
      alert("No data available!");
      return;
    }

    const invoice = $("invoiceTemplate");
    const tbody = invoice?.querySelector("tbody");
    if (!invoice || !tbody) return;

    tbody.innerHTML = "";

    let grandTotal = 0;

    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length < 3) return;

      const date = cols[0].innerText.trim();
      const items = cols[1].innerText.trim();
      const total = cols[2].innerText.trim();

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

    $("invoiceDate").innerText =
      "Generated: " + new Date().toLocaleString();

    $("invoiceGrandTotal").innerText =
      "Grand Total: ₹ " + grandTotal;

    await new Promise(r => setTimeout(r, 300));

    const canvas = await html2canvas(invoice, {
      scale: 2,
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    doc.save("Ghar_Manager_Invoice.pdf");
  });

  /* =========================
     IMAGE EXPORT FIXED
  ========================== */
  $("imgBtn")?.addEventListener("click", async function () {

    const tableWrapper = document.querySelector(".table-wrapper");
    if (!tableWrapper || !tableWrapper.innerHTML.trim()) {
      alert("No data to capture!");
      return;
    }

    await new Promise(r => setTimeout(r, 200));

    const canvas = await html2canvas(tableWrapper, {
      scale: 2,
      backgroundColor: "#ffffff"
    });

    const link = document.createElement("a");
    link.download = "Kitchen_Table.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  /* =========================
     WHATSAPP SHARE FIXED
  ========================== */
  window.shareTable = function () {

    const rows = document.querySelectorAll("#kitchenTable tr");
    if (!rows.length) {
      alert("No data to share!");
      return;
    }

    let totalAmount = 0;
    let message =
`━━━━━━━━━━━━━━━━━━━━
🏠 *GHAR MANAGER*
🍳 *Kitchen Expense Report*
━━━━━━━━━━━━━━━━━━━━

`;

    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length < 3) return;

      const date = cols[0].innerText;
      const items = cols[1].innerText;
      const total = cols[2].innerText;

      const amount = parseAmount(total);
      totalAmount += amount;

      message +=
`📅 *Date:* ${date}
🛒 *Items:*
${items}
💰 *Total:* ₹ ${amount}
──────────────────

`;
    });

    message +=
`━━━━━━━━━━━━━━━━━━━━
💎 *Grand Total: ₹${totalAmount}*
📊 Managed by Ghar Manager
━━━━━━━━━━━━━━━━━━━━`;

    const url =
      /Android|iPhone/i.test(navigator.userAgent)
        ? `https://wa.me/?text=${encodeURIComponent(message)}`
        : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");
  };

  /* =========================
     KITCHEN CRUD SAFE
  ========================== */
  window.saveKitchenEntry = function () {

    const total = parseAmount($("totalAmount")?.value);

    if (!tempItems.length) {
      alert("Add items first!");
      return;
    }

    kitchenData.push({
      date: new Date().toISOString(),
      items: [...tempItems],
      total
    });

    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));
    tempItems = [];

    renderKitchen();
  };

  function renderKitchen() {

    const table = $("kitchenTable");
    if (!table) return;

    table.innerHTML = kitchenData.map((entry, index) => `
      <tr>
        <td>${new Date(entry.date).toLocaleString()}</td>
        <td>${entry.items.join("<br>")}</td>
        <td>₹ ${entry.total}</td>
        <td><button onclick="deleteEntry(${index})">Delete</button></td>
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
    let total = kitchenData.reduce((sum, e) => sum + e.total, 0);
    if ($("grandTotal")) $("grandTotal").innerText = total;
    if ($("kitchenTotal")) $("kitchenTotal").innerText = total;
  }

  /* =========================
     INITIAL RENDER
  ========================== */
  renderKitchen();

});
