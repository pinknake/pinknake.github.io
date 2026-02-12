const masterItems = {
  Spices: ["Mirch", "Haldi", "Dhaniya", "Jeera", "Garam Masala"],
  Oils: ["Mustard Oil 1L", "Mustard Oil 5L", "Refined Oil 1L"],
  Grains: ["Rice", "Atta", "Chane White 250g"],
  Dairy: ["Ghee 1kg", "Ghee 2kg", "Milk"],
  Snacks: ["Biscuits", "Chips", "Namkeen"],
  Bathroom: ["Soap 2 Pack", "Soap 4 Pack", "Clinic Plus", "Surf Excel 1kg", "Vanish"]
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

function shareTable(){
  const lang = prompt("Share in English or Hindi? Type: en / hi");

  let message = "";

  if(lang==="hi"){
    message = "📊 रसोई खर्च सूची\n\n";
  } else {
    message = "📊 Kitchen Expense List\n\n";
  }

  kitchenData.forEach(e=>{
    message += `📅 ${e.date}\n`;
    e.items.forEach(i=> message += `• ${i}\n`);
    message += `💰 Total: ₹${e.total}\n\n`;
  });

  window.open("https://wa.me/?text="+encodeURIComponent(message));
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
