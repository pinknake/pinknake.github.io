document.addEventListener("DOMContentLoaded", () => {

/* ================= HELPERS ================= */

const $ = (id) => document.getElementById(id);

const safeJSONParse = (key, fallback = []) => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : fallback;
  } catch {
    return fallback;
  }
};

let kitchenData = safeJSONParse("kitchenData", []);

const saveKitchen = () =>
  localStorage.setItem("kitchenData", JSON.stringify(kitchenData));

/* ================= ITEMS ================= */

const itemsData = {
  Vegetable: ["Tomato/टमाटर", "Potato", "Onion"],
  Spices: ["Haldi", "Mirch", "Jeera"],
  Dairy: ["Milk", "Paneer", "Curd"]
};

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
  const qty = $("quantity")?.value?.trim();
  const type = $("typeCategory")?.value || "";
  const amount = Number($("amount")?.value);

  if (!qty || isNaN(amount) || amount <= 0) {
    alert("Fill valid quantity and amount!");
    return;
  }

  kitchenData.push({
    date: new Date().toLocaleString(),
    item,
    qty,
    type,
    amount
  });

  saveKitchen();

  if ($("quantity")) $("quantity").value = "";
  if ($("amount")) $("amount").value = "";

  renderTable();
};

/* ================= TABLE ================= */

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
  if (i < 0 || i >= kitchenData.length) return;
  kitchenData.splice(i, 1);
  saveKitchen();
  renderTable();
};

/* ================= WHATSAPP ================= */

window.shareWhatsApp = () => {

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

  window.open("https://wa.me/?text=" + encodeURIComponent(msg));
};

/* ================= PDF ================= */

window.downloadPDF = async () => {

  let sub = JSON.parse(localStorage.getItem("subscriptionData"));
  if (!sub) {
    alert("Subscription Error");
    return;
  }

  const today = new Date();

  /* ===== CHECK ACCESS ===== */
  const trialStart = new Date(sub.trialStart);
  const trialActive =
    Math.floor((today - trialStart) / 86400000) < TRIAL_DAYS;

  let premiumActive = false;

  if (sub.isPremium && sub.premiumStart) {
    const start = new Date(sub.premiumStart);
    premiumActive =
      Math.floor((today - start) / 86400000) < (sub.premiumDays || 30);
  }

  if (!trialActive && !premiumActive) {
    $("pdfBtn")?.classList.add("locked");
    setTimeout(() => $("pdfBtn")?.classList.remove("locked"), 500);
    alert("Premium Required");
    return;
  }

  if (!kitchenData.length) {
    alert("No Data!");
    return;
  }

  const invoice = $("invoiceTemplate");
  const tbody = invoice.querySelector("tbody");

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

  const canvas = await html2canvas(invoice, {
    scale: 3,
    useCORS: true
  });

  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const imgWidth = 190;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  doc.addImage(img, "PNG", 10, 10, imgWidth, imgHeight);
  doc.save("Kitchen_Invoice.pdf");
};

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

  updateSubscriptionUI(sub);
}

  function updateSubscriptionUI(sub) {
  const badge = $("premiumBadge");
  const pdfBtn = $("pdfBtn");
  const premiumBox = $("premiumBox");

  if (!badge || !pdfBtn || !premiumBox) return;

  const today = new Date();

  /* ===== CHECK PREMIUM ===== */
  if (sub.isPremium && sub.premiumStart) {
    const start = new Date(sub.premiumStart);
    const diff = Math.floor((today - start) / 86400000);
    const daysLeft = (sub.premiumDays || 30) - diff;

    if (daysLeft > 0) {
      badge.innerText = "💎 PREMIUM";
      badge.className = "premium-badge premium-active";

      pdfBtn.innerText = `📄 PDF (${daysLeft}d left)`;
      pdfBtn.style.opacity = "1";

      premiumBox.style.display = "none";
      return;
    } else {
      sub.isPremium = false;
      localStorage.setItem("subscriptionData", JSON.stringify(sub));
    }
  }

  /* ===== CHECK TRIAL ===== */
  const trialStart = new Date(sub.trialStart);
  const trialDiff = Math.floor((today - trialStart) / 86400000);
  const trialLeft = TRIAL_DAYS - trialDiff;

  if (trialLeft > 0) {
    badge.innerText = `🟢 TRIAL (${trialLeft}d)`;
    badge.className = "premium-badge trial-active";

    pdfBtn.innerText = `📄 PDF (${trialLeft} trial)`;
    premiumBox.style.display = "none";
  } else {
    badge.innerText = "🔒 FREE";
    badge.className = "premium-badge expired";

    pdfBtn.innerText = "🔒 PDF (Premium)";
    pdfBtn.style.opacity = "0.6";

    premiumBox.style.display = "block";
  }
}

window.activatePremium = function(days = 30) {
  let sub = JSON.parse(localStorage.getItem("subscriptionData"));

  sub.isPremium = true;
  sub.premiumStart = new Date().toISOString();
  sub.premiumDays = days;

  localStorage.setItem("subscriptionData", JSON.stringify(sub));

  alert("Premium Activated 🔥");
  location.reload();
};
  
  let tapCount = 0;

$("premiumBox")?.addEventListener("click", () => {
  tapCount++;

  if (tapCount >= 5) {
    const pass = prompt("Enter Admin Password");

    if (pass === "ankush123") {
      activatePremium(30);
    } else {
      alert("Wrong Password");
    }

    tapCount = 0;
  }

  setTimeout(() => tapCount = 0, 3000);
});

  window.downloadPDF = async () => {

  let sub = JSON.parse(localStorage.getItem("subscriptionData"));
  if (!sub) {
    alert("Subscription Error");
    return;
  }

  const today = new Date();

  /* ===== CHECK ACCESS ===== */
  const trialStart = new Date(sub.trialStart);
  const trialActive =
    Math.floor((today - trialStart) / 86400000) < TRIAL_DAYS;

  let premiumActive = false;

  if (sub.isPremium && sub.premiumStart) {
    const start = new Date(sub.premiumStart);
    premiumActive =
      Math.floor((today - start) / 86400000) < (sub.premiumDays || 30);
  }

  if (!trialActive && !premiumActive) {
    $("pdfBtn")?.classList.add("locked");
    setTimeout(() => $("pdfBtn")?.classList.remove("locked"), 500);
    alert("Premium Required");
    return;
  }

  if (!kitchenData.length) {
    alert("No Data!");
    return;
  }

  const invoice = $("invoiceTemplate");
  const tbody = invoice.querySelector("tbody");

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

  const canvas = await html2canvas(invoice, {
    scale: 3,
    useCORS: true
  });

  const img = canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");

  const imgWidth = 190;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  doc.addImage(img, "PNG", 10, 10, imgWidth, imgHeight);
  doc.save("Kitchen_Invoice.pdf");
};

  
  /* ================= REST SAME (THEME, PWA, SW) ================= */
/* untouched except safety checks */

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

  if ('serviceWorker' in navigator) {

  navigator.serviceWorker.register('./sw.js')
    .then(reg => {

      reg.onupdatefound = () => {

        const newWorker = reg.installing;

        newWorker.onstatechange = () => {

          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {

            showUpdateBanner();

          }
        };
      };
    });

}

function showUpdateBanner() {

  const banner = document.getElementById("updateBanner");

  if (!banner) return;

  banner.classList.add("show");

  banner.onclick = () => {
    window.location.reload();
  };
}

  function triggerSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(sw => {
      sw.sync.register('syncData');
    });
  }
}

  function enableNotifications() {

  if (!("Notification" in window)) return;

  Notification.requestPermission().then(permission => {

    if (permission === "granted") {

      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification("Notifications Enabled 🎉");
      });

    }

  });
}
/* ================= INIT ================= */

initSubscription();
renderTable();

});
