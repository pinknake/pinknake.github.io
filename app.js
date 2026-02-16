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

    if (!kitchenData.length) return alert("No Data!");

    let total = 0;
    let msg = "🍳 GHAR MANAGER\n\n";

    kitchenData.forEach(e => {
      total += e.amount;
      msg += `${e.date}\n${e.item} (${e.qty}) - ${e.type}\n₹ ${e.amount}\n\n`;
    });

    msg += `Total ₹ ${total}`;

    window.open("https://wa.me/?text=" + encodeURIComponent(msg));
  };

  /* ================= PDF ================= */

  window.downloadPDF = async () => {

  if (!isPremiumUser()) {
    alert("PDF is Premium Feature. Please Upgrade.");
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

const TRIAL_DAYS = 7;

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
      isPremium: false
    };
    localStorage.setItem("subscriptionData", JSON.stringify(sub));
  }

  checkSubscription(sub);
}

function checkSubscription(sub) {
  const premiumBox = document.getElementById("premiumBox");
  const pdfBtn = document.getElementById("pdfBtn");

  if (!premiumBox || !pdfBtn) return;

  const trialStart = new Date(sub.trialStart);
  const today = new Date();
  const diffDays = Math.floor((today - trialStart) / (1000*60*60*24));
  const daysLeft = TRIAL_DAYS - diffDays;

  if (sub.isPremium) {
    premiumBox.style.display = "none";
    pdfBtn.innerText = "📄 Download PDF";
    pdfBtn.style.opacity = "1";
    return;
  }

  if (diffDays >= TRIAL_DAYS) {
    premiumBox.style.display = "block";
    premiumBox.querySelector("p").innerText = 
      "Trial Expired! Unlock PDF Feature";

    pdfBtn.innerText = "🔒 PDF (Premium)";
    pdfBtn.style.opacity = "0.6";
  } else {
    premiumBox.style.display = "none";
    pdfBtn.innerText = `📄 PDF (${daysLeft} days left)`;
  }
}

function isPremiumUser(){
  try{
    const sub = JSON.parse(localStorage.getItem("subscriptionData"));
    return sub?.isPremium === true;
  } catch {
    return false;
  }
}

window.showUpgrade = function(){
  alert("💎 Premium Plan ₹99\n\nPay via UPI: yourupi@bank\n\nAfter payment contact on WhatsApp.");
};

  
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

  /* ================= INSTALL APP ================= */

  let deferredPrompt;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $("installBtn").style.display = "block";
  });

  $("installBtn")?.addEventListener("click", async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt = null;
    }
  });

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
