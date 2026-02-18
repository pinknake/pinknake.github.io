document.addEventListener("DOMContentLoaded", () => {

  /* =====================================================
     PRODUCTION LEVEL GHAR KITCHEN MANAGER APP.JS
  ====================================================== */

  /* ================= HELPERS ================= */

  const $ = (id) => document.getElementById(id);

  const safeJSONParse = (key, fallback = []) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  };

  const saveStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  /* ================= DATA ================= */

  let kitchenData = safeJSONParse("kitchenData", []);

  const itemsData = {
    Vegetable: ["Tomato", "Potato", "Onion"],
    Spices: ["Haldi", "Mirch", "Jeera"],
    Dairy: ["Milk", "Paneer", "Curd"]
  };

  /* ================= LOAD ITEMS ================= */

  function loadItems() {
    const category = $("mainCategory")?.value;
    const itemSelect = $("itemSelect");

    if (!category || !itemSelect) return;

    itemSelect.innerHTML = "";

    const list = itemsData[category] || [];

    list.forEach(item => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      itemSelect.appendChild(option);
    });
  }

  $("mainCategory")?.addEventListener("change", loadItems);
  loadItems();

  /* ================= ADD ENTRY ================= */

  window.addKitchenEntry = () => {

    const item = $("itemSelect")?.value || "";
    const qty = $("quantity")?.value.trim();
    const type = $("typeCategory")?.value || "";
    const amount = Number($("amount")?.value);

    if (!qty || isNaN(amount) || amount <= 0) {
      alert("Enter valid quantity and amount!");
      return;
    }

    kitchenData.push({
      date: new Date().toLocaleString(),
      item,
      qty,
      type,
      amount
    });

    saveStorage("kitchenData", kitchenData);

    $("quantity").value = "";
    $("amount").value = "";

    renderTable();
  };

  /* ================= DELETE ENTRY ================= */

  window.deleteEntry = (index) => {
    if (index < 0 || index >= kitchenData.length) return;

    kitchenData.splice(index, 1);
    saveStorage("kitchenData", kitchenData);
    renderTable();
  };

  /* ================= RENDER TABLE ================= */

  function renderTable() {
    const table = $("kitchenTable");
    if (!table) return;

    let rows = "";

    kitchenData.forEach((e, i) => {
      rows += `
        <tr>
          <td>${e.date}</td>
          <td>${e.item}</td>
          <td>${e.qty}</td>
          <td>${e.type}</td>
          <td>₹ ${e.amount}</td>
          <td><button onclick="deleteEntry(${i})">❌</button></td>
        </tr>
      `;
    });

    table.innerHTML = rows;
  }

  /* ================= WHATSAPP SHARE ================= */

  window.shareWhatsApp = () => {

    if (!kitchenData.length) {
      alert("No Data to Share!");
      return;
    }

    let total = 0;
    let msg = "🍳 GHAR KITCHEN MANAGER\n\n";

    kitchenData.forEach(e => {
      total += e.amount;
      msg += `${e.date}\n${e.item} (${e.qty}) - ${e.type}\n₹ ${e.amount}\n\n`;
    });

    msg += `Total ₹ ${total}`;

    if (msg.length > 3000) {
      alert("Too much data to share!");
      return;
    }

    window.open("https://wa.me/?text=" + encodeURIComponent(msg));
  };

  /* ================= PDF EXPORT ================= */

  window.downloadPDF = async () => {

    if (!isPremiumActive()) {
      alert("Premium Required for PDF Export");
      return;
    }

    if (!kitchenData.length) {
      alert("No Data to Export!");
      return;
    }

    const invoice = $("invoiceTemplate");
    const tbody = invoice?.querySelector("tbody");

    if (!invoice || !tbody) return;

    tbody.innerHTML = "";

    let total = 0;

    kitchenData.forEach(e => {
      total += e.amount;

      tbody.innerHTML += `
        <tr>
          <td>${e.date}</td>
          <td>${e.item}</td>
          <td>${e.qty}</td>
          <td>${e.type}</td>
          <td>₹ ${e.amount}</td>
        </tr>
      `;
    });

    $("invoiceDate").innerText =
      "Date: " + new Date().toLocaleString();
    $("invoiceTotal").innerText =
      "Grand Total ₹ " + total;

    const canvas = await html2canvas(invoice, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    const imgProps = doc.getImageProperties(img);
    const pdfWidth = doc.internal.pageSize.getWidth() - 20;
    const pdfHeight =
      (imgProps.height * pdfWidth) / imgProps.width;

    doc.addImage(img, "PNG", 10, 10, pdfWidth, pdfHeight);
    doc.save("Kitchen_Invoice.pdf");
  };

  /* ================= PREMIUM SYSTEM ================= */

  const PREMIUM_KEY = "isPremiumUser";

  function isPremiumActive() {
    return localStorage.getItem(PREMIUM_KEY) === "true";
  }

  function updateBadge() {
    const badge = $("premiumBadge");
    if (!badge) return;

    if (isPremiumActive()) {
      badge.textContent = "💎 PREMIUM";
      badge.classList.add("premium-active");
    } else {
      badge.textContent = "FREE";
      badge.classList.remove("premium-active");
    }
  }

  window.activatePremium = () => {
    localStorage.setItem(PREMIUM_KEY, "true");
    updateBadge();
    alert("Premium Activated!");
  };

  updateBadge();

  /* ================= THEME ================= */

  const themeBtn = $("themeToggle");

  function setTheme(theme) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);

    if (themeBtn)
      themeBtn.textContent =
        theme === "dark" ? "☀️" : "🌙";
  }

  setTheme(localStorage.getItem("theme") || "light");

  themeBtn?.addEventListener("click", () => {
    const current =
      document.body.classList.contains("dark")
        ? "dark"
        : "light";
    setTheme(current === "dark" ? "light" : "dark");
  });

  /* ================= SHARE APP ================= */

  window.shareApp = () => {
    const url = window.location.origin;

    if (navigator.share) {
      navigator.share({
        title: "Kitchen Manager",
        text: "Track kitchen expenses easily!",
        url
      }).catch(() => {});
    } else {
      window.open(
        "https://wa.me/?text=" +
          encodeURIComponent(url)
      );
    }
  };

  /* ================= PWA INSTALL ================= */

  let deferredPrompt;
  const installBtn = $("installBtn");

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn?.style.setProperty("display", "inline-block");
  });

  installBtn?.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    deferredPrompt = null;
    installBtn?.style.setProperty("display", "none");
  });

  window.addEventListener("appinstalled", () => {
    installBtn?.style.setProperty("display", "none");
  });

  /* ================= SERVICE WORKER ================= */

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
      .catch(() => {});
  }

  /* ================= INIT ================= */

  renderTable();
});
