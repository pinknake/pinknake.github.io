document.addEventListener("DOMContentLoaded", function () {

  const $ = (id) => document.getElementById(id);

  let kitchenData = JSON.parse(localStorage.getItem("kitchenData")) || [];

  // TAB SWITCH
  window.showTab = function (id) {
    document.querySelectorAll(".tab").forEach(tab =>
      tab.classList.remove("active")
    );
    $(id).classList.add("active");
  };

  // ADD ENTRY
  window.addEntry = function () {

    const item = $("itemName").value.trim();
    const qty = $("qty").value.trim();
    const total = Number($("totalAmount").value);

    if (!item || !qty || !total) {
      alert("Fill all fields!");
      return;
    }

    kitchenData.push({
      date: new Date().toLocaleString(),
      item,
      qty,
      total
    });

    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));

    $("itemName").value = "";
    $("qty").value = "";
    $("totalAmount").value = "";

    renderTable();
  };

  function renderTable() {

    const table = $("kitchenTable");

    table.innerHTML = kitchenData.map((e, i) => `
      <tr>
        <td>${e.date}</td>
        <td>${e.item}</td>
        <td>${e.qty}</td>
        <td>₹ ${e.total}</td>
        <td><button onclick="deleteEntry(${i})">❌</button></td>
      </tr>
    `).join("");

    const total = kitchenData.reduce((sum, e) => sum + e.total, 0);
    $("grandTotal").innerText = total;
  }

  window.deleteEntry = function (i) {
    kitchenData.splice(i, 1);
    localStorage.setItem("kitchenData", JSON.stringify(kitchenData));
    renderTable();
  };

  // WHATSAPP SHARE
  window.shareWhatsApp = function () {

    if (!kitchenData.length) return alert("No data!");

    let msg = "🏠 GHAR MANAGER\n\n";

    kitchenData.forEach(e => {
      msg += `${e.date}\n${e.item} (${e.qty}) - ₹${e.total}\n\n`;
    });

    window.open("https://wa.me/?text=" + encodeURIComponent(msg));
  };

  // PDF
  $("pdfBtn").addEventListener("click", async function () {

    const invoice = $("invoiceTemplate");
    const tbody = invoice.querySelector("tbody");

    tbody.innerHTML = "";
    let total = 0;

    kitchenData.forEach(e => {
      total += e.total;
      tbody.innerHTML += `
        <tr>
          <td>${e.date}</td>
          <td>${e.item}</td>
          <td>${e.qty}</td>
          <td>₹ ${e.total}</td>
        </tr>
      `;
    });

    $("invoiceDate").innerText = new Date().toLocaleString();
    $("invoiceGrandTotal").innerText = "Grand Total: ₹ " + total;

    const canvas = await html2canvas(invoice);
    const img = canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.addImage(img, "PNG", 10, 10, 190, 0);
    doc.save("Ghar_Manager.pdf");
  });

  // IMAGE
  $("imgBtn").addEventListener("click", async function () {
    const table = $("kitchenTable");
    const canvas = await html2canvas(table);
    const link = document.createElement("a");
    link.download = "Kitchen.png";
    link.href = canvas.toDataURL();
    link.click();
  });

  renderTable();
});
