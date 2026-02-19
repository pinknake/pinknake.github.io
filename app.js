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

  let sub;
  try {
    sub = JSON.parse(localStorage.getItem("subscriptionData"));
  } catch {
    alert("Subscription Error");
    return;
  }

  if (!sub) {
    alert("Subscription Error");
    return;
  }

  const today = new Date();

  const trialStart = new Date(sub.trialStart);
  const trialDiff = Math.floor((today - trialStart) / 86400000);
  const trialActive = trialDiff < TRIAL_DAYS;

  let premiumActive = false;

  if (sub.isPremium && sub.premiumStart) {
    const start = new Date(sub.premiumStart);
    const diff = Math.floor((today - start) / 86400000);
    premiumActive = diff < (sub.premiumDays || 30);
  }

  if (!trialActive && !premiumActive) {

    const btn = $("pdfBtn");
    btn?.classList.add("locked");

    setTimeout(() => btn?.classList.remove("locked"), 500);

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

  $("invoiceDate") && ($("invoiceDate").innerText =
    "Date: " + new Date().toLocaleString());

  $("invoiceTotal") && ($("invoiceTotal").innerText =
    "Grand Total ₹ " + total);

  try {
    const canvas = await html2canvas(invoice, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF("p", "mm", "a4");

    doc.addImage(img, "PNG", 10, 10, 190, 0);
    doc.save("Kitchen_Invoice.pdf");
  } catch {
    alert("PDF Generation Failed");
  }
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
