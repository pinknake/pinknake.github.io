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

function addKitchen(){
  const name=document.getElementById("itemName").value;
  const qty=document.getElementById("itemQty").value;
  if(!name||!qty)return;
  kitchen.push({name,qty});
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
