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

    itemsData[category].forEach(item => {
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

    const item = $("itemSelect")?.value;
    const qty = $("quantity")?.value.trim();
    const type = $("typeCategory")?.value;
    const amount = Number($("amount")?.value);

    if (!qty || !amount) {
      alert("Fill quantity and amount!");
      return;
    }

    kitchenData.push({
      date: new Date().toLocaleString(),
      item,
      qty,
      type,
      amount
    });

    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));

    $("quantity").value = "";
    $("amount").value = "";

    renderTable();
  };

  /* ================= RENDER TABLE ================= */

  function renderTable() {
    const table = $("kitchenTable");
    if (!table) return;

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

  window.deleteEntry = (i) => {
    kitchenData.splice(i, 1);
    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));
    renderTable();
  };

  /* ================= WHATSAPP SHARE ================= */

  window.shareWhatsApp = () => {

  if (!kitchenData.length) return alert("No entries to share!");

  let total = 0;

  // ================= Header =================
  let msg = "🏠🟣 *Ghar Manager – Kitchen Report* 🟣🏠\n\n";

  // ================= Rows =================
  kitchenData.forEach((e) => {
    total += e.amount;

    // Category emoji
    let catEmoji = "";
    if (/Tomato|Potato|Onion/i.test(e.item)) catEmoji = "🥦"; 
    else if (/Haldi|Mirch|Jeera/i.test(e.item)) catEmoji = "🌶️"; 
    else if (/Milk|Paneer|Curd/i.test(e.item)) catEmoji = "🥛"; 
    else catEmoji = "🍴";

    msg += `${catEmoji} *${e.item}*\n`;
    msg += `📅 Date: ${e.date.split(",")[0]}\n`;
    msg += `⚖️ Qty: ${e.qty}\n`;
    msg += `📦 Type: ${e.type}\n`;
    msg += `💰 Amount: ₹${e.amount}\n`;
    msg += "────────────────────────\n";
  });

  // ================= Footer =================
  msg += `💎 *Grand Total:* ₹${total}\n`;
  msg += "✨ Generated via *Ghar Manager App* 🔥\n";
  msg += "📲 Download: https://pinknake.github.io/index.html\n";
  msg += "🏠🏠 Thank You! 🏠🏠";

  // Open WhatsApp
  const whatsappUrl = "https://wa.me/?text=" + encodeURIComponent(msg);
  window.open(whatsappUrl);
};

  
/* ================= PDF DOWNLOAD ================= */

window.downloadPDF = async () => {

  const sub = JSON.parse(localStorage.getItem("subscriptionData"));
  const today = new Date();

  if (!sub) {
    alert("Subscription Error");
    return;
  }

  // ===== CHECK TRIAL =====
  const trialStart = new Date(sub.trialStart);
  const trialDiff = Math.floor((today - trialStart) / (1000*60*60*24));
  const trialActive = trialDiff < TRIAL_DAYS;

  // ===== CHECK PREMIUM =====
  let premiumActive = false;

  if (sub.isPremium && sub.premiumStart) {
    const start = new Date(sub.premiumStart);
    const diff = Math.floor((today - start) / (1000*60*60*24));
    premiumActive = diff < (sub.premiumDays || 30);
  }

  if (!trialActive && !premiumActive) {
    const btn = document.getElementById("pdfBtn");
    btn.classList.add("locked");

    setTimeout(() => {
      btn.classList.remove("locked");
    }, 500);

    alert("Premium Required");
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

const TRIAL_DAYS = 0;

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

function updateSubscription(sub) {

  const premiumBox = document.getElementById("premiumBox");
  const pdfBtn = document.getElementById("pdfBtn");

  if (!premiumBox || !pdfBtn) return;

  const today = new Date();

  // ===== CHECK PREMIUM =====
  if (sub.isPremium && sub.premiumStart) {
    const start = new Date(sub.premiumStart);
    const diff = Math.floor((today - start) / (1000*60*60*24));
    const daysLeft = (sub.premiumDays || 30) - diff;

    if (daysLeft > 0) {
      premiumBox.style.display = "none";
      pdfBtn.innerText = `📄 Download PDF (${daysLeft} Days Left)`;
      pdfBtn.style.opacity = "1";

      updateBadge("premium");
      return;
    } else {
      sub.isPremium = false;
      localStorage.setItem("subscriptionData", JSON.stringify(sub));
    }
  }

  // ===== CHECK TRIAL =====
  const trialStart = new Date(sub.trialStart);
  const trialDiff = Math.floor((today - trialStart) / (1000*60*60*24));
  const trialLeft = TRIAL_DAYS - trialDiff;

  if (trialLeft > 0) {
    premiumBox.style.display = "none";
    pdfBtn.innerText = `📄 Download PDF (${trialLeft} Trial Days Left)`;
    pdfBtn.style.opacity = "1";

    updateBadge("trial", trialLeft);
  } else {
    premiumBox.style.display = "block";
    pdfBtn.innerText = "🔒 PDF (Premium)";
    pdfBtn.style.opacity = "0.6";

    updateBadge("expired");
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

  let sub = JSON.parse(localStorage.getItem("subscriptionData"));

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


/* ================= INIT ================= */


  /* ================= THEME ================= */

  const themeBtn = $("themeToggle");

  function setTheme(theme) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
    if (themeBtn)
      themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
  }

  setTheme(localStorage.getItem("theme") || "light");

  themeBtn?.addEventListener("click", () => {
    const current = document.body.classList.contains("dark") ? "dark" : "light";
    setTheme(current === "dark" ? "light" : "dark");
  });

  /* ================= MANUAL REFRESH ================= */

  $("manualRefresh")?.addEventListener("click", () => {
    location.reload(true);
  });

  /* ================= SHARE APP ================= */
window.shareApp = () => {

  const url = "https://pinknake.github.io/";

  const text =
`🍳 *GHAR MANAGER APP*

✅ Track kitchen expenses
📄 Export beautiful PDF invoices
📊 Manage daily grocery easily
📲 Install & use offline

🚀 Try now:
${url}`;

  if (navigator.share) {
    navigator.share({
      title: "Ghar Manager App",
      text: "Manage kitchen expenses easily 🍳",
      url
    }).catch(() => {});
  } else {
    const wa = "https://wa.me/?text=" + encodeURIComponent(text);
    window.open(wa, "_blank");
  }

};
  
  
/* ================= PWA INSTALL ================= */

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.style.display = "inline-block";
});

installBtn?.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();

  const result = await deferredPrompt.userChoice;

  if (result.outcome === "accepted") {
    console.log("App Installed");
  }

  deferredPrompt = null;
  installBtn.style.display = "none";
});

window.addEventListener("appinstalled", () => {
  console.log("PWA Installed Successfully");
  installBtn.style.display = "none";
});

  /* iOS Install Detection */

function isIos(){
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode(){
  return ('standalone' in window.navigator) && window.navigator.standalone;
}

if(isIos() && !isInStandaloneMode()){
  if(installBtn){
    installBtn.style.display = "inline-block";
    installBtn.innerText = "📲 Add to Home";

    installBtn.addEventListener("click", () => {
      alert("Tap Share ➜ Add to Home Screen");
    });
  }
}
  
  /* ================= SERVICE WORKER ================= */

  if ("serviceWorker" in navigator) {

    navigator.serviceWorker.register("sw.js").then(reg => {

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateBanner();
          }
        });
      });

    }).catch(err => console.log("SW Error:", err));
  }

  function showUpdateBanner() {
    const banner = $("updateBanner");
    if (!banner) return;

    banner.classList.add("show");

    setTimeout(() => {
      banner.classList.remove("show");
      window.location.reload();
    }, 2500);
  }

  /* ================= BACKGROUND AUTO REFRESH ================= */

  setInterval(() => {
    if (navigator.onLine) {
      console.log("Background sync check...");
    }
  }, 30000);

initSubscription();
renderTable();
});
