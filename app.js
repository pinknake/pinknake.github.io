document.addEventListener("DOMContentLoaded", () => {

  /* ================= HELPERS ================= */

  const $ = (id) => document.getElementById(id);

  const safeJSONParse = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  };

  let kitchenData = safeJSONParse("kitchenData");

  /* ================= ITEM DATA ================= */

  const itemsData = {
    Vegetable: ["Tomato/टमाटर", "Potato", "Onion"],
    Spices: ["Haldi", "Mirch", "Jeera"],
    Dairy: ["Milk", "Paneer", "Curd"]
  };

  /* ================= LOAD ITEMS ================= */

  function loadItems() {
    const category = $("mainCategory")?.value;
    const itemSelect = $("itemSelect");

    if (!category || !itemSelect) return;

    itemSelect.innerHTML = "";

    (itemsData[category] || []).forEach(item => {
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
    const type = $("typeCategory")?.value || "Open";
    const amount = Number($("amount")?.value);

    if (!qty || !amount || amount <= 0) {
      alert("⚠️ Fill valid quantity & amount");
      return;
    }

    const entry = {
      date: new Date().toLocaleString(),
      item,
      qty,
      type,
      amount
    };

    kitchenData.unshift(entry); // latest on top

    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));

    if ($("quantity")) $("quantity").value = "";
    if ($("amount")) $("amount").value = "";

    renderTable();
  };

  /* ================= RENDER TABLE ================= */

  function renderTable() {
    const table = $("kitchenTable");
    if (!table) return;

    if (!kitchenData.length) {
      table.innerHTML = `<tr><td colspan="6">No entries yet</td></tr>`;
      return;
    }

    table.innerHTML = kitchenData.map((e, i) => `
      <tr>
        <td>${e.date}</td>
        <td>${e.item}</td>
        <td>${e.qty}</td>
        <td>${e.type}</td>
        <td>₹ ${e.amount}</td>
        <td><button onclick="deleteEntry(${i})">❌</button></td>
      </tr>
    `).join("");
  }

  /* ================= DELETE ENTRY ================= */

  window.deleteEntry = (i) => {

    if (!confirm("Delete this entry?")) return;

    kitchenData.splice(i, 1);
    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));
    renderTable();
  };
  
  /* ================= HELPERS GLOBAL ================= */

const $ = (id) => document.getElementById(id);
const getKitchenData = () => {
  try {
    return JSON.parse(localStorage.getItem("kitchenData")) || [];
  } catch {
    return [];
  }
};

const TRIAL_DAYS = 3;

/* ================= WHATSAPP SHARE ================= */

window.shareWhatsApp = () => {

  const kitchenData = getKitchenData();

  if (!kitchenData.length) {
    alert("No Data!");
    return;
  }

  let total = 0;
  let msg = "🍳 GHAR MANAGER\n\n";

  kitchenData.forEach(e => {
    total += e.amount;
    msg += `${e.date}\n${e.item} (${e.qty}) - ${e.type}\n₹ ${e.amount}\n\n`;
  });

  msg += `Total ₹ ${total}`;

  window.open("https://wa.me/?text=" + encodeURIComponent(msg), "_blank");
};


/* ================= PDF DOWNLOAD ================= */

window.downloadPDF = async () => {

  const kitchenData = getKitchenData();

  if (!kitchenData.length) {
    alert("No Data to Export!");
    return;
  }

  const sub = JSON.parse(localStorage.getItem("subscriptionData") || "{}");
  const today = new Date();

  /* ===== CHECK TRIAL ===== */
  let trialActive = false;

  if (sub.trialStart) {
    const trialStart = new Date(sub.trialStart);
    const trialDiff = Math.floor((today - trialStart) / (1000 * 60 * 60 * 24));
    trialActive = trialDiff < TRIAL_DAYS;
  }

  /* ===== CHECK PREMIUM ===== */
  let premiumActive = false;

  if (sub.isPremium && sub.premiumStart) {
    const start = new Date(sub.premiumStart);
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    premiumActive = diff < (sub.premiumDays || 30);
  }

  if (!trialActive && !premiumActive) {

    const btn = $("pdfBtn");
    btn?.classList.add("locked");

    setTimeout(() => btn?.classList.remove("locked"), 500);

    alert("Premium Required");
    return;
  }

  /* ===== GENERATE PDF ===== */

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

  $("invoiceDate").innerText = "Date: " + new Date().toLocaleString();
  $("invoiceTotal").innerText = "Grand Total ₹ " + total;

  const canvas = await html2canvas(invoice, { scale: 2 });
  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  doc.addImage(img, "PNG", 10, 10, 190, 0);
  doc.save("Kitchen_Invoice.pdf");
};
  

/* ================= SUBSCRIPTION ================= */

const TRIAL_DAYS = 3;

function initSubscription() {

  let sub;

  try {
    sub = JSON.parse(localStorage.getItem("subscriptionData"));
  } catch {
    sub = null;
  }

  if (!sub) {
    sub = {
      trialStart: new Date().toISOString(),
      isPremium: false,
      premiumStart: null,
      premiumDays: 30
    };
    localStorage.setItem("subscriptionData", JSON.stringify(sub));
  }

  updateSubscription(sub);
}


/* ================= UPDATE SUB ================= */

function updateSubscription(sub) {

  const premiumBox = document.getElementById("premiumBox");
  const pdfBtn = document.getElementById("pdfBtn");
  const subCard = document.getElementById("subscriptionCard");

  if (!premiumBox || !pdfBtn) return;

  const today = new Date();

  /* ===== CHECK PREMIUM ===== */
  if (sub.isPremium && sub.premiumStart) {

    const start = new Date(sub.premiumStart);
    const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
    const daysLeft = (sub.premiumDays || 30) - diff;

    if (daysLeft > 0) {

      premiumBox.style.display = "none";
      pdfBtn.innerText = `📄 Download PDF (${daysLeft} Days Left)`;
      pdfBtn.style.opacity = "1";

      subCard && (subCard.innerHTML = `💎 Premium Active<br>${daysLeft} days left`);

      updateBadge("premium", daysLeft);
      return;

    } else {
      sub.isPremium = false;
      localStorage.setItem("subscriptionData", JSON.stringify(sub));
    }
  }

  /* ===== CHECK TRIAL ===== */
  const trialStart = new Date(sub.trialStart);
  const trialDiff = Math.floor((today - trialStart) / (1000 * 60 * 60 * 24));
  const trialLeft = TRIAL_DAYS - trialDiff;

  if (trialLeft > 0) {

    premiumBox.style.display = "none";
    pdfBtn.innerText = `📄 Download PDF (${trialLeft} Trial Days Left)`;
    pdfBtn.style.opacity = "1";

    subCard && (subCard.innerHTML = `🆓 Trial Active<br>${trialLeft} days left`);

    updateBadge("trial", trialLeft);

  } else {

    premiumBox.style.display = "block";
    pdfBtn.innerText = "🔒 PDF (Premium)";
    pdfBtn.style.opacity = "0.6";

    subCard && (subCard.innerHTML = `❌ Trial Expired<br>Upgrade Required`);

    updateBadge("expired", 0);
  }
}


/* ================= BADGE ================= */

/* ================= BADGE ================= */

function updateBadge(status, daysLeft = 0) {

  const badge = document.getElementById("premiumBadge");
  if (!badge) return;

  badge.className = "premium-badge";

  if (status === "premium") {
    badge.innerText = "💎 PREMIUM";
    badge.classList.add("premium-active");
  }
  else if (status === "trial") {
    badge.innerText = `🟢 TRIAL (${daysLeft}d)`;
    badge.classList.add("trial-active");
  }
  else {
    badge.innerText = "FREE";
    badge.classList.add("expired");
  }
}

/* ================= FUNCTION BADGES ======== */ 
  function updateBadge(status, daysLeft = 0){

  const badge = document.getElementById("premiumBadge");
  if(!badge) return;

  badge.classList.remove("premium-active","trial-active","expired");

  if(status === "premium"){
    badge.innerText = "💎 PREMIUM";
    badge.classList.add("premium-active");
  }
  else if(status === "trial"){
    badge.innerText = `🟢 TRIAL (${daysLeft}d)`;
    badge.classList.add("trial-active");
  }
  else{
    badge.innerText = "🔴 EXPIRED";
    badge.classList.add("expired");
  }
}
  
/* ================= PREMIUM ACTIVATION ================= */

window.activatePremium = function(days = 30){

  let sub;

  try {
    sub = JSON.parse(localStorage.getItem("subscriptionData"));
  } catch {
    sub = null;
  }

  if (!sub) return alert("Subscription Error");

  sub.isPremium = true;
  sub.premiumStart = new Date().toISOString();
  sub.premiumDays = days;

  localStorage.setItem("subscriptionData", JSON.stringify(sub));

  alert("Premium Activated for " + days + " Days!");
  location.reload();
};
/* ================= ADMIN TAP ================= */

let tapCount = 0;

document.getElementById("premiumBox")?.addEventListener("click", function(){

  tapCount++;

  if(tapCount >= 5){

    const pass = prompt("Enter Admin Password");

    if(pass === "ankush123"){
      activatePremium(30);
    } else {
      alert("Wrong Password");
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

  if (themeBtn) themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

setTheme(localStorage.getItem("theme") || "light");

themeBtn?.addEventListener("click", () => {
  const current = document.body.classList.contains("dark") ? "dark" : "light";
  setTheme(current === "dark" ? "light" : "dark");
});


/* ================= MANUAL REFRESH ================= */

$("manualRefresh")?.addEventListener("click", () => {
  location.reload();
});


/* ================= SHARE APP ================= */

window.shareApp = () => {
  const url = window.location.href;

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


/* ================= PWA INSTALL ================= */

let deferredPrompt = null;
const installBtn = $("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn && (installBtn.style.display = "inline-block");
});

installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  await deferredPrompt.userChoice;

  deferredPrompt = null;
  installBtn.style.display = "none";
});

window.addEventListener("appinstalled", () => {
  installBtn && (installBtn.style.display = "none");
});


/* ================= iOS INSTALL ================= */

function isIos(){
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone(){
  return window.matchMedia('(display-mode: standalone)').matches;
}

if(isIos() && !isStandalone() && installBtn){
  installBtn.style.display = "inline-block";
  installBtn.innerText = "📲 Add to Home";

  installBtn.onclick = () => alert("Tap Share ➜ Add to Home Screen");
}


/* ================= SERVICE WORKER ================= */

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
  .then(reg => {

    if (reg.waiting) showUpdateBanner();

    reg.addEventListener("updatefound", () => {
      const newWorker = reg.installing;

      newWorker?.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateBanner();
        }
      });
    });

  })
  .catch(err => console.log("SW Error:", err));
}

function showUpdateBanner() {
  const banner = $("updateBanner");
  if (!banner) return;

  banner.classList.add("show");

  setTimeout(() => {
    banner.classList.remove("show");
    location.reload();
  }, 2500);
}


/* ================= BACKGROUND CHECK ================= */

setInterval(() => {
  if (navigator.onLine) console.log("Background sync check...");
}, 30000);


/* ================= INIT ================= */

initSubscription();
renderTable();
