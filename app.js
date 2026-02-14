document.addEventListener("DOMContentLoaded", function () {

  /* =========================
     SHARE APP
  ========================== */
  window.shareApp = function () {
    if (navigator.share) {
      navigator.share({
        title: "Ghar Manager",
        text: "Check out my Ghar Manager App 🔥",
        url: window.location.origin
      });
    } else {
      window.open("https://wa.me/?text=" + encodeURIComponent(window.location.origin));
    }
  };

  /* =========================
   SAFE PDF EXPORT
========================== */
const pdfBtn = document.getElementById("pdfBtn");

if (pdfBtn) {

  pdfBtn?.addEventListener("click", async function () {

  const rows = document.querySelectorAll("#kitchenTable tr");

  if (rows.length === 0) {
    alert("No data available!");
    return;
  }

  const invoice = document.getElementById("invoiceTemplate");
  const tbody = invoice.querySelector("tbody");
  tbody.innerHTML = "";

  let grandTotal = 0;

  rows.forEach(row => {

    const cols = row.querySelectorAll("td");
    if (cols.length < 3) return;

    const date = cols[0].innerText;
    const items = cols[1].innerText;
    const total = cols[2].innerText;

    grandTotal += Number(total.replace(/[^\d]/g, ""));

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="border:1px solid #ccc;padding:6px;">${date}</td>
      <td style="border:1px solid #ccc;padding:6px;">${items}</td>
      <td style="border:1px solid #ccc;padding:6px;color:red;">${total}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("invoiceDate").innerText =
    "Generated: " + new Date().toLocaleString();

  document.getElementById("invoiceGrandTotal").innerText =
    "Grand Total: ₹ " + grandTotal;

  await new Promise(resolve => setTimeout(resolve, 300));

  const canvas = await html2canvas(invoice, { scale: 2 });

  const imgData = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const imgWidth = 190;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  doc.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
  doc.save("Ghar_Manager_Invoice.pdf");

});

  
  document.getElementById("waPdfBtn")?.addEventListener("click", function () {
  alert("Download PDF first, then share manually on WhatsApp.\n\nBrowser security direct PDF auto-share allow nahi karta.");
});
/* =========================
   SAFE IMAGE EXPORT
========================== */
document.getElementById("imgBtn")?.addEventListener("click", async function () {

  const table = document.querySelector("#kitchenTable");

  if (!table || table.innerHTML.trim() === "") {
    alert("No data to capture!");
    return;
  }

  await new Promise(resolve => setTimeout(resolve, 200));

  const canvas = await html2canvas(table, { scale: 2 });

  const link = document.createElement("a");
  link.download = "Kitchen_Table.png";
  link.href = canvas.toDataURL("image/png");
  link.click();

});

        
  /* =========================
     MASTER ITEMS
  ========================== */
  const masterItems = {
    Spices: ["Mirch/मिर्च","Haldi/हल्दी","Dhaniya/धनिया","Jeera/जीरा","Garam Masala/गरम मसाला","कड़ी पत्ता","बेसन","मैदा"],
    Oils: ["Mustard Oil/सरसों तेल 1L","Mustard Oil 5L","Refined Oil/रिफाइंड 1L"],
    Grains: ["Rice/चावल","Atta/आटा","सफेद चना","काले छोले","मूंग दाल","चना दाल","काली दाल"],
    Shabji: ["टमाटर","मटर","गोभी","आलू","प्याज","बैंगन","पत्ता गोभी"],
    Dairy: ["देसी घी","पनीर","दूध","दही"],
    Snacks: ["बिस्कुट","चिप्स","भुजिया","समोसा"],
    Bathroom: ["Soap 2 Pack","Soap 4 Pack","Surf Excel","Vanish"]
  };

  let kitchenData = JSON.parse(localStorage.getItem("kitchenData")) || [];
  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let market = JSON.parse(localStorage.getItem("market")) || [];
  let tempItems = [];

  /* =========================
     CATEGORY LOAD
  ========================== */
  const categoryEl = document.getElementById("category");
  const itemEl = document.getElementById("itemSelect");

  function loadCategories() {
    if (!categoryEl) return;
    categoryEl.innerHTML = Object.keys(masterItems)
      .map(cat => `<option>${cat}</option>`).join("");
    loadItems();
  }

  function loadItems() {
    if (!itemEl) return;
    const cat = categoryEl.value;
    itemEl.innerHTML = masterItems[cat]
      .map(i => `<option>${i}</option>`).join("");
  }

  if (categoryEl) {
    categoryEl.addEventListener("change", loadItems);
    loadCategories();
  }

  /* =========================
     KITCHEN
  ========================== */
  window.addTempItem = function () {
    const qty = document.getElementById("qty").value;
    const type = document.getElementById("type").value;
    const item = itemEl.value;

    if (!qty) return alert("Enter quantity");

    tempItems.push(`${item} - ${qty} (${type})`);
    renderTemp();
  };

  function renderTemp() {
    const list = document.getElementById("tempList");
    if (!list) return;

    list.innerHTML = tempItems.map((i, index) =>
      `<li>${i} <button onclick="removeTemp(${index})">❌</button></li>`
    ).join("");
  }

  window.removeTemp = function (i) {
    tempItems.splice(i, 1);
    renderTemp();
  };

  window.saveKitchenEntry = function () {
    const total = Number(document.getElementById("totalAmount").value);
    if (tempItems.length === 0) return alert("Add items first");

    kitchenData.push({
      date: new Date().toISOString(),
      items: [...tempItems],
      total: total || 0
    });

    tempItems = [];
    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));
    renderKitchen();
    renderTemp();
  };

  function renderKitchen() {
    const table = document.getElementById("kitchenTable");
    if (!table) return;

    table.innerHTML = kitchenData.map((entry, index) => `
      <tr>
        <td>${new Date(entry.date).toLocaleString()}</td>
        <td>${entry.items.join("<br>")}</td>
        <td>₹ ${entry.total}</td>
        <td><button onclick="deleteEntry(${index})">Delete</button></td>
      </tr>
    `).join("");

    updateHomeSummary();
  }

  window.deleteEntry = function (i) {
    kitchenData.splice(i, 1);
    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));
    renderKitchen();
  };

  function updateHomeSummary() {
    let today = 0, week = 0, month = 0, total = 0;
    const now = new Date();
    const currentWeek = getWeekNumber(now);

    kitchenData.forEach(e => {
      const d = new Date(e.date);
      total += e.total;

      if (d.toDateString() === now.toDateString()) today += e.total;
      if (getWeekNumber(d) === currentWeek) week += e.total;
      if (d.getMonth() === now.getMonth()) month += e.total;
    });

    setText("todayTotal", today);
    setText("weekTotal", week);
    setText("monthTotal", month);
    setText("grandTotal", total);
    setText("kitchenTotal", total);
    setText("monthlyTotal", month);
  }

  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  /* =========================
     MARKET
  ========================== */
  window.addMarket = function () {
    const item = document.getElementById("marketItem").value;
    if (!item) return;
    market.push(item);
    localStorage.setItem("market", JSON.stringify(market));
    renderMarket();
  };

  function renderMarket() {
    const list = document.getElementById("marketList");
    if (!list) return;
    list.innerHTML = market.map(i => `<li>${i}</li>`).join("");
  }

  /* =========================
     TRANSACTIONS
  ========================== */
  window.addTransaction = function () {
    const person = document.getElementById("person").value;
    const amount = document.getElementById("amount").value;
    const method = document.getElementById("method").value;
    if (!person || !amount) return;

    transactions.push({ person, amount, method });
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderHistory();
  };

  function renderHistory() {
    const list = document.getElementById("historyList");
    if (!list) return;
    list.innerHTML = transactions.map(t =>
      `<li>${t.person} - ₹${t.amount} (${t.method})</li>`
    ).join("");
  }


window.shareTable = function () {

  const table = document.getElementById("kitchenTable");
  if (!table) {
    alert("No table found!");
    return;
  }

  const rows = table.querySelectorAll("tr");

  if (rows.length === 0) {
    alert("No data to share!");
    return;
  }

  let totalAmount = 0;

  let message =
"━━━━━━━━━━━━━━━━━━━━\n" +
"🏠 *GHAR MANAGER*\n" +
"🍳 *Kitchen Expense Report*\n" +
"━━━━━━━━━━━━━━━━━━━━\n\n";

  rows.forEach(row => {
    const cols = row.querySelectorAll("td");

    if (cols.length >= 3) {

      const date = cols[0].innerText;
      const items = cols[1].innerText;
      const total = cols[2].innerText;

      totalAmount += Number(total.replace(/[^\d]/g, ""));

      message += 
        "📅 *Date:* " + date + "\n" +
        "🛒 *Items:*\n" + items + "\n" +
        "💰 *Total:* " + total + "\n" +
        "──────────────────\n\n";
    }
  });

  message +=
"━━━━━━━━━━━━━━━━━━━━\n" +
"💎 *Grand Total: ₹" + totalAmount + "*\n" +
"📊 Managed by Ghar Manager App\n" +
"━━━━━━━━━━━━━━━━━━━━";

  const encodedMessage = encodeURIComponent(message);

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const url = isMobile
    ? `https://wa.me/?text=${encodedMessage}`
    : `https://web.whatsapp.com/send?text=${encodedMessage}`;

  window.open(url, "_blank");
};

  /* =========================
     UTIL
  ========================== */
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  }

  window.showTab = function (id) {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    const el = document.getElementById(id);
    if (el) el.classList.add("active");
  };

  function updateDateTime() {
    const el = document.getElementById("datetime");
    if (!el) return;
    const now = new Date();
    el.innerText = now.toLocaleDateString() + " | " + now.toLocaleTimeString();
  }
  setInterval(updateDateTime, 1000);
  updateDateTime();

  /* =========================
     PWA INSTALL
  ========================== */
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById("installBtn");
    if (btn) btn.style.display = "block";
  });

  const installBtn = document.getElementById("installBtn");
  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        installBtn.style.display = "none";
        deferredPrompt = null;
      }
    });
  }

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js");
  }

  /* INITIAL RENDER */
  renderKitchen();
  renderMarket();
  renderHistory();

});
