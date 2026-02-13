function shareApp(){
  if(navigator.share){
    navigator.share({
      title: "Ghar Manager",
      text: "Check out my Ghar Manager App 🔥",
      url: window.location.href
    });
  } else {
    window.open("https://wa.me/?text=" + encodeURIComponent(window.location.href));
  }
}


const masterItems = {
  Spices: [
    "Mirch/मिर्च",
    "Haldi/हल्दी",
    "Dhaniya/धनिया",
    "Jeera/जीरा",
    "Garam Masala/गरम मसाला",
    "कड़ी पत्ता",
    "बेसन",
    "मैदा"
  ],

  Oils: [
    "Mustard Oil/सरसों तेल 1L",
    "Mustard Oil 5L",
    "Refined Oil/रिफाइंड 1L"
  ],

  Grains: [
    "Rice/चावल",
    "Atta/आटा",
    "Chane White 250g/सफेद चना",
    "काले छोले",
    "मूंग दाल",
    "चना दाल",
    "मां दाल",
    "काली दाल",
    "मुंगी मश्री दाल"
  ],

  Shabji: [
    "Shabji/सब्जी",
    "Tamato/टमाटर",
    "Pea/मटर",
    "Coleflower/गोभी",
    "Potato/आलू",
    "प्याज",
    "बैंगन",
    "पत्ता गोभी",
    "शिमला मिर्च",
    "हरी मिर्च",
    "लहसुन",
    "गाजर",
    "मूली"
  ],

  Dairy: [
    "Ghee/देसी घी",
    "पनीर",
    "Milk/दूध",
    "Curd/दही"
  ],

  Snacks: [
    "Biscuits/बिस्कुट",
    "Chips/लेस",
    "Haldiram Bhujia",
    "Samosa/समोसा"
  ],

  Bathroom: [
    "Soap 2 Pack",
    "Soap 4 Pack",
    "Clinic Plus",
    "Surf Excel",
    "Vanish",
    "Ezzy"
  ]
};

let kitchenData = JSON.parse(localStorage.getItem("kitchenData")) || [];
let tempItems = [];

const categoryEl = document.getElementById("category");
const itemEl = document.getElementById("itemSelect");

function loadCategories(){
  categoryEl.innerHTML = Object.keys(masterItems)
    .map(cat=>`<option>${cat}</option>`).join("");
  loadItems();
}

function loadItems(){
  const cat = categoryEl.value;
  itemEl.innerHTML = masterItems[cat]
    .map(i=>`<option>${i}</option>`).join("");
}

categoryEl.addEventListener("change", loadItems);
loadCategories();

function addTempItem(){
  const item = itemEl.value;
  const qty = document.getElementById("qty").value;
  const type = document.getElementById("type").value;

  if(!qty) return alert("Enter quantity");

  tempItems.push(`${item} - ${qty} (${type})`);
  renderTemp();
}

function renderTemp(){
  document.getElementById("tempList").innerHTML =
    tempItems.map((i,index)=>
      `<li>${i} 
        <button onclick="removeTemp(${index})">❌</button>
      </li>`).join("");
}

function removeTemp(i){
  tempItems.splice(i,1);
  renderTemp();
}

function saveKitchenEntry(){
  const total = document.getElementById("totalAmount").value;
  if(tempItems.length===0) return alert("Add items first");

  kitchenData.push({
    date: new Date().toLocaleString(),
    items: [...tempItems],
    total: Number(total),
  });

  tempItems = [];
  localStorage.setItem("kitchenData", JSON.stringify(kitchenData));
  renderKitchen();
  renderTemp();
}

function renderKitchen(){
  document.getElementById("kitchenTable").innerHTML =
    kitchenData.map((entry,index)=>`
      <tr>
        <td>${entry.date}</td>
        <td>${entry.items.join("<br>")}</td>
        <td>₹ ${entry.total}</td>
        <td>
          <button class="delete-btn" onclick="deleteEntry(${index})">Delete</button>
        </td>
      </tr>
    `).join("");
    updateHomeSummary();
  
  const totalExpense = kitchenData.reduce((a,b)=>a+b.total,0);
  document.getElementById("kitchenTotal").innerText = totalExpense;

  const month = new Date().getMonth();
  const monthly = kitchenData.filter(e=> new Date(e.date).getMonth()===month)
                .reduce((a,b)=>a+b.total,0);

  document.getElementById("monthlyTotal").innerText = monthly;
  
}

function deleteEntry(i){
  kitchenData.splice(i,1);
  localStorage.setItem("kitchenData", JSON.stringify(kitchenData));
  renderKitchen();
}

function updateHomeSummary(){

  const now = new Date();
  const today = now.toDateString();
  const currentWeek = now.getWeek?.() || getWeekNumber(now);
  const currentMonth = now.getMonth();

  let todayTotal=0, weekTotal=0, monthTotal=0, grandTotal=0;

  kitchenData.forEach(e=>{
    const d = new Date(e.date);
    grandTotal += e.total;

    if(d.toDateString()===today){
      todayTotal += e.total;
    }

    if(getWeekNumber(d)===currentWeek){
      weekTotal += e.total;
    }

    if(d.getMonth()===currentMonth){
      monthTotal += e.total;
    }
  });

  document.getElementById("todayTotal").innerText = todayTotal;
  document.getElementById("weekTotal").innerText = weekTotal;
  document.getElementById("monthTotal").innerText = monthTotal;
  document.getElementById("grandTotal").innerText = grandTotal;
}

function getWeekNumber(d){
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
}


function shareTable(){

  const lang = prompt("Type language: en / hi");

  let msg = "";

  if(lang==="hi"){
    msg += "🏠 *रसोई खर्च पोर्टफोलियो*\n";
    msg += "🍳 Happy Home ❤️\n\n";
  } else {
    msg += "🏠 *Kitchen Expense Portfolio*\n";
    msg += "🍳 Happy Home ❤️\n\n";
  }

  kitchenData.forEach(e=>{
    msg += "━━━━━━━━━━━━━━\n";
    msg += `📅 ${e.date}\n`;
    e.items.forEach(i=>{
      msg += `🛒 ${i}\n`;
    });
    msg += `💰 Total: ₹${e.total}\n`;
    msg += "━━━━━━━━━━━━━━\n\n";
  });

  msg += "📊 Generated by Ghar Manager";

  window.open("https://wa.me/?text="+encodeURIComponent(msg));
}

renderKitchen();


function showTab(id){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function updateDateTime(){
  const now = new Date();
  document.getElementById("datetime").innerText =
    now.toLocaleDateString() + " | " + now.toLocaleTimeString();
}
setInterval(updateDateTime,1000);
updateDateTime();

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let kitchen = JSON.parse(localStorage.getItem("kitchen")) || [];
let market = JSON.parse(localStorage.getItem("market")) || [];

function saveData(){
  localStorage.setItem("transactions",JSON.stringify(transactions));
  localStorage.setItem("kitchen",JSON.stringify(kitchen));
  localStorage.setItem("market",JSON.stringify(market));
  render();
}

function addTransaction(){
  const person=document.getElementById("person").value;
  const amount=document.getElementById("amount").value;
  const method=document.getElementById("method").value;
  if(!person||!amount)return;
  transactions.push({person,amount,method,date:new Date().toLocaleString()});
  saveData();
}

function addMarket(){
  const item=document.getElementById("marketItem").value;
  if(!item)return;
  market.push(item);
  saveData();
}

function shareWhatsApp(){
  let text="🛒 Market List:\n"+market.join("\n");
  window.open("https://wa.me/?text="+encodeURIComponent(text));
}

function render(){
  document.getElementById("totalExpense").innerText=
    transactions.reduce((a,b)=>a+Number(b.amount),0);
  document.getElementById("totalEntries").innerText=transactions.length;

  document.getElementById("historyList").innerHTML=
    transactions.map(t=>`<li>${t.person} - ₹${t.amount} (${t.method})</li>`).join("");

  document.getElementById("kitchenList").innerHTML=
    kitchen.map(i=>`<li>${i.name} - ${i.qty}</li>`).join("");

  document.getElementById("marketList").innerHTML=
    market.map(i=>`<li>${i}</li>`).join("");
}

render();

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", async ()=>{
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    installBtn.style.display = "none";
    deferredPrompt = null;
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", ()=> {
    navigator.serviceWorker.register("./sw.js")
      .then(()=>console.log("SW registered"))
      .catch(err=>console.log("SW error", err));
  });
}
