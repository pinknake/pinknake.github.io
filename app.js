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

  /* =====================================================
   PRODUCTION SUBSCRIPTION + PDF SYSTEM
===================================================== */

const TRIAL_DAYS = 3; // Change if needed

function getSubscription() {
  try {
    return JSON.parse(localStorage.getItem("subscriptionData"));
  } catch {
    return null;
  }
}

function saveSubscription(data) {
  localStorage.setItem("subscriptionData", JSON.stringify(data));
}

function initSubscription() {

  let sub = getSubscription();

  if (!sub) {
    sub = {
      trialStart: new Date().toISOString(),
      isPremium: false,
      premiumStart: null,
      premiumDays: 30
    };
    saveSubscription(sub);
  }

  updateSubscriptionUI();
}

function isTrialActive(sub) {
  if (!sub?.trialStart) return false;

  const today = new Date();
  const trialStart = new Date(sub.trialStart);
  const diff = Math.floor((today - trialStart) / (1000*60*60*24));

  return diff < TRIAL_DAYS;
}

function getPremiumDaysLeft(sub) {
  if (!sub?.isPremium || !sub?.premiumStart) return 0;

  const today = new Date();
  const start = new Date(sub.premiumStart);
  const diff = Math.floor((today - start) / (1000*60*60*24));

  return (sub.premiumDays || 30) - diff;
}

function isPremiumActive(sub) {
  return getPremiumDaysLeft(sub) > 0;
}

/* ================= UPDATE UI ================= */

function updateSubscriptionUI() {

  const sub = getSubscription();
  if (!sub) return;

  const premiumBox = document.getElementById("premiumBox");
  const pdfBtn = document.getElementById("pdfBtn");

  if (!pdfBtn) return;

  const premiumDaysLeft = getPremiumDaysLeft(sub);

  if (isPremiumActive(sub)) {

    premiumBox && (premiumBox.style.display = "none");
    pdfBtn.innerText = `📄 Download PDF (${premiumDaysLeft} Days Left)`;
    pdfBtn.style.opacity = "1";

    updateBadge("premium");
    return;
  }

  if (isTrialActive(sub)) {

    const today = new Date();
    const trialStart = new Date(sub.trialStart);
    const diff = Math.floor((today - trialStart) / (1000*60*60*24));
    const trialLeft = TRIAL_DAYS - diff;

    premiumBox && (premiumBox.style.display = "none");
    pdfBtn.innerText = `📄 Download PDF (${trialLeft} Trial Days Left)`;
    pdfBtn.style.opacity = "1";

    updateBadge("trial", trialLeft);
    return;
  }

  premiumBox && (premiumBox.style.display = "block");
  pdfBtn.innerText = "🔒 PDF (Premium Required)";
  pdfBtn.style.opacity = "0.6";

  updateBadge("expired");
}

/* ================= BADGE ================= */

function updateBadge(status, daysLeft = 0) {

  const badge = document.getElementById("premiumBadge");
  if (!badge) return;

  badge.classList.remove("premium-active", "trial-active", "expired");

  if (status === "premium") {
    badge.innerText = "💎 PREMIUM";
    badge.classList.add("premium-active");
  }
  else if (status === "trial") {
    badge.innerText = `🟢 TRIAL (${daysLeft}d)`;
    badge.classList.add("trial-active");
  }
  else {
    badge.innerText = "🔴 EXPIRED";
    badge.classList.add("expired");
  }
}

/* ================= PDF DOWNLOAD ================= */

window.downloadPDF = async () => {

  const sub = getSubscription();
  if (!sub) {
    alert("Subscription Error");
    return;
  }

  if (!isPremiumActive(sub) && !isTrialActive(sub)) {

    const btn = document.getElementById("pdfBtn");
    btn?.classList.add("locked");

    setTimeout(() => {
      btn?.classList.remove("locked");
    }, 500);

    alert("Premium Required");
    return;
  }

  if (!window.kitchenData || !kitchenData.length) {
    alert("No Data to Export!");
    return;
  }

  const invoice = document.getElementById("invoiceTemplate");
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

  document.getElementById("invoiceDate").innerText =
    "Date: " + new Date().toLocaleString();

  document.getElementById("invoiceTotal").innerText =
    "Grand Total ₹ " + total;

  const canvas = await html2canvas(invoice, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const imgProps = doc.getImageProperties(img);
  const pdfWidth = doc.internal.pageSize.getWidth() - 20;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  doc.addImage(img, "PNG", 10, 10, pdfWidth, pdfHeight);
  doc.save("Kitchen_Invoice.pdf");
};

/* ================= PREMIUM ACTIVATION ================= */

window.activatePremium = function(days = 30) {

  const sub = getSubscription();
  if (!sub) return;

  sub.isPremium = true;
  sub.premiumStart = new Date().toISOString();
  sub.premiumDays = days;

  saveSubscription(sub);

  alert("Premium Activated for " + days + " Days!");
  location.reload();
};

/* ================= ADMIN TAP (SAFER) ================= */

let tapCount = 0;

document.getElementById("premiumBox")?.addEventListener("click", function(){

  tapCount++;

  if (tapCount >= 5) {

    const pass = prompt("Enter Admin Code");

    // Basic obfuscated password
    const correct = atob("YW5rdXNoMTIz"); // ankush123

    if (pass === correct) {
      activatePremium(30);
    } else {
      alert("Wrong Code");
    }

    tapCount = 0;
  }

  setTimeout(() => { tapCount = 0; }, 3000);
});



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
