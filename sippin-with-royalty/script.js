const drinks = [
  'Tropical Paradise','Peachy Sunshine','Shark Attack','Electric Berry Blast',
  'Strawberry Lemon Drop','Palm Tree Punch','Island Breeze','Coral Lagoon Splash','Cotton Candy Cloud'
];

function fillDrinkLists(){
  document.querySelectorAll('[data-drink-list]').forEach(el=>{
    el.innerHTML = drinks.map(d=>`<div class="drink-card card">${d}</div>`).join('');
  });
  const checks=document.querySelector('[data-drink-checks]');
  if(checks){checks.innerHTML=drinks.map((d,i)=>`<label class="check"><input type="checkbox" name="drinks" value="${d}"> ${d}</label>`).join('')}
}

function loadAccount(){
  const account=JSON.parse(localStorage.getItem('royalAccount')||'null');
  const profile=document.querySelector('[data-profile]');
  const form=document.querySelector('[data-account-form]');
  if(!profile||!form)return;
  if(account){
    document.querySelector('#acctName').value=account.name||'';
    document.querySelector('#acctEmail').value=account.email||'';
    document.querySelector('#acctPhone').value=account.phone||'';
    document.querySelector('#acctPassword').value=account.password||'';
  }
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const email=document.querySelector('#acctEmail').value.trim();
    const phone=document.querySelector('#acctPhone').value.trim();
    if(!email && !phone){ profile.textContent='Add an email or phone number.'; return; }
    const data={name:document.querySelector('#acctName').value,email,phone,password:document.querySelector('#acctPassword').value};
    localStorage.setItem('royalAccount',JSON.stringify(data));
    profile.textContent='Saved!';
  });
  const bookings=JSON.parse(localStorage.getItem('royalBookings')||'[]');
  const list=document.querySelector('[data-bookings]');
  list.innerHTML=bookings.length?bookings.map(b=>`<div class="booking-row"><strong>${b.eventType}</strong><br>${b.date} at ${b.time}<br><small>${b.name}</small></div>`).join(''):'No past bookings yet.';
  const accountPts=document.querySelector('[data-account-points]');
  if(accountPts) accountPts.textContent=`${Number(localStorage.getItem('royalPoints')||15)} / 15`;
}

function setupBooking(){
  const form=document.querySelector('#bookingForm');
  if(!form)return;
  const option=document.querySelector('#paymentPlan');
  const pricing=document.querySelector('#pricingHelp');
  function updatePricing(){
    const type=document.querySelector('#eventType').value;
    if(type==='Festival'){
      pricing.textContent='Festival: No booking fee. Guests buy drinks for $3, $4, or $5.';
      option.innerHTML='<option value="Guests Pay">Guests Pay</option>';
    }else{
      pricing.textContent='Host Pays: $75 for 40 drinks. Guests Pay: $50 booking fee, then guests buy drinks.';
      option.innerHTML='<option value="Host Pays">Host Pays — $75 for 40 drinks</option><option value="Guests Pay">Guests Pay — $50 booking fee</option>';
    }
  }
  document.querySelector('#eventType').addEventListener('change',updatePricing); updatePricing();
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const fd=new FormData(form);
    const booking={
      eventType:fd.get('eventType'),date:fd.get('date'),time:fd.get('time'),location:fd.get('location'),
      guests:fd.get('guests'),paymentPlan:fd.get('paymentPlan'),name:fd.get('name'),phone:fd.get('phone'),email:fd.get('email'),
      drinks:fd.getAll('drinks'),customDrink:fd.get('customDrink'),theme:fd.get('theme'),notes:fd.get('notes')
    };
    const bookings=JSON.parse(localStorage.getItem('royalBookings')||'[]'); bookings.unshift(booking); localStorage.setItem('royalBookings',JSON.stringify(bookings));
    try{
      if(location.protocol.startsWith('http')){
        await fetch('/',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams(fd).toString()});
      }
    }catch(err){ console.log('Saved on this device.'); }
    document.querySelector('#thankYou').style.display='block';
    document.querySelector('#thankYou').scrollIntoView({behavior:'smooth',block:'center'});
  });
}

function setupRewards(){
  const saved=Number(localStorage.getItem('royalPoints')||15);
  const pts=Math.max(0,saved);
  const number=document.querySelector('[data-points-number]');
  const bar=document.querySelector('[data-points-bar]');
  const claim=document.querySelector('[data-claim]');
  if(!number)return;
  number.textContent=`${pts} / 15 Royal Points`;
  bar.style.width=`${Math.min(100,(pts/15)*100)}%`;
  claim.disabled=pts<15;
  claim.textContent=pts>=15?'CLAIM FREE MEDIUM DRINK':'KEEP SIPPING 👑';
  const histBox=document.querySelector('[data-reward-history]');
  if(histBox){
    const hist=JSON.parse(localStorage.getItem('royalRewardHistory')||'[]');
    histBox.innerHTML=hist.length?hist.map(h=>`<div class="booking-row"><strong>${h.reward}</strong><br><small>${h.date}</small></div>`).join(''):'No past rewards yet.';
  }
  claim.addEventListener('click',()=>{
    if(pts>=15){
      localStorage.setItem('royalPoints',String(pts-15));
      const hist=JSON.parse(localStorage.getItem('royalRewardHistory')||'[]');
      hist.unshift({reward:'Free medium drink',date:new Date().toLocaleDateString()});
      localStorage.setItem('royalRewardHistory',JSON.stringify(hist));
      alert('Reward claimed! One free medium drink.');location.reload()
    }
  });
}

document.addEventListener('DOMContentLoaded',()=>{fillDrinkLists();setupBooking();loadAccount();setupRewards();});
