document.addEventListener("DOMContentLoaded", function () {

  const $ = (id) => document.getElementById(id);

  const itemsData = {
    Vegetable: ["Tomato", "Potato", "Onion"],
    Spices: ["Haldi", "Mirch", "Jeera"],
    Dairy: ["Milk", "Paneer", "Curd"]
  };

  let kitchenData = JSON.parse(localStorage.getItem("kitchenData")) || [];

  // LOAD ITEMS
  function loadItems() {
    const category = $("mainCategory").value;
    const itemSelect = $("itemSelect");
    itemSelect.innerHTML = "";

    itemsData[category].forEach(item => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      itemSelect.appendChild(option);
    });
  }

  $("mainCategory").addEventListener("change", loadItems);
  loadItems();

  // ADD ENTRY
  window.addKitchenEntry = function () {

    const item = $("itemSelect").value;
    const qty = $("quantity").value.trim();
    const type = $("typeCategory").value;
    const amount = Number($("amount").value);

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

  function renderTable() {

    const table = $("kitchenTable");

    table.innerHTML = kitchenData.map((e,i)=>`
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

  window.deleteEntry = function(i){
    kitchenData.splice(i,1);
    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));
    renderTable();
  };

  // WHATSAPP SHARE
  window.shareWhatsApp = function () {

    if (!kitchenData.length) return alert("No Data!");

    let total = 0;
    let msg = "🍳 GHAR MANAGER\n\n";

    kitchenData.forEach(e=>{
      total += e.amount;
      msg += `${e.date}\n${e.item} (${e.qty}) - ${e.type}\n₹ ${e.amount}\n\n`;
    });

    msg += `Total ₹ ${total}`;

    window.open("https://wa.me/?text=" + encodeURIComponent(msg));
  };

  // PDF
  window.downloadPDF = async function () {

  if (!kitchenData.length) {
    alert("No data available!");
    return;
  }

  const invoice = document.getElementById("invoiceTemplate");
  const tbody = invoice.querySelector("tbody");

  tbody.innerHTML = "";
  let total = 0;

  kitchenData.forEach(e=>{
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
  const doc = new jsPDF("p","mm","a4");

  doc.addImage(img,"PNG",10,10,190,0);
  doc.save("Kitchen_Invoice.pdf");
};
  
// Theme System
const themeBtn = document.getElementById("themeToggle");

function setTheme(theme) {
  document.body.classList.remove("light","dark");
  document.body.classList.add(theme);
  localStorage.setItem("theme", theme);
  themeBtn.textContent = theme === "dark" ? "☀️" : "🌙";
}

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";
setTheme(savedTheme);

themeBtn.addEventListener("click", () => {
  const current = document.body.classList.contains("dark") ? "dark" : "light";
  setTheme(current === "dark" ? "light" : "dark");
}); 
  
//UpdateApp

function updateApp() {
  if (newWorker) {
    newWorker.postMessage({ action: 'skipWaiting' });
  }
  window.location.reload();
}
  
  
  //ShareApp
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
  let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById("installBtn").style.display = "block";
});

document.getElementById("installBtn").addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt = null;
  }
});

  // PWA Register
let newWorker;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(reg => {

    reg.addEventListener('updatefound', () => {
      newWorker = reg.installing;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          document.getElementById("updateBanner").style.display = "block";
        }
      });
    });

  });
}

  renderTable();

});
