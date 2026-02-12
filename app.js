const itemsDatabase = {
  Spices: ["Mirch (Chili)", "Haldi (Turmeric)", "Dhaniya", "Jeera"],
  Vegetables: ["Potato", "Onion", "Tomato"],
  Snacks: ["Biscuits", "Chips", "Namkeen"],
  Bathroom: ["Soap 2 Pack", "Soap 4 Pack", "Clinic Plus Packet", "Clinic Plus 5L Bottle", "Surf Excel 500g", "Surf Excel 1kg", "Surf Excel 5kg"],
  Groceries: ["Ghee 1kg", "Ghee 2kg", "Mustard Oil 1L", "Mustard Oil 5L", "Chane 150g", "Chane 250g"]
};
let kitchenRecords = JSON.parse(localStorage.getItem("kitchenRecords")) || [];

const categorySelect = document.getElementById("category");
const predefinedSelect = document.getElementById("predefinedItems");

function loadItems(){
  const category = categorySelect.value;
  predefinedSelect.innerHTML = itemsDatabase[category]
    .map(item => `<option>${item}</option>`)
    .join("");
}
categorySelect.addEventListener("change", loadItems);
loadItems();

function addKitchenItem(){
  const item = predefinedSelect.value;
  const quantity = document.getElementById("quantity").value;
  const type = document.getElementById("itemType").value;

  if(!quantity) return alert("Enter quantity");

  kitchenRecords.push({
    date: new Date().toLocaleString(),
    item: `${item} - ${quantity} (${type})`,
    amount: ""
  });

  localStorage.setItem("kitchenRecords", JSON.stringify(kitchenRecords));
  renderKitchen();
}

function renderKitchen(){
  document.getElementById("kitchenTable").innerHTML =
    kitchenRecords.map((r,i)=>`
      <tr>
        <td>${r.date}</td>
        <td>${r.item}</td>
        <td>
          <input type="number" placeholder="Enter ₹" 
          value="${r.amount}"
          onchange="updateAmount(${i}, this.value)">
        </td>
      </tr>
    `).join("");
}

function updateAmount(index,value){
  kitchenRecords[index].amount = value;
  localStorage.setItem("kitchenRecords", JSON.stringify(kitchenRecords));
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
