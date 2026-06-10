let data = JSON.parse(localStorage.getItem("randevu")) || [];

function save(){
  let r = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    service: document.getElementById("service").value,
    date: document.getElementById("date").value,
    time: document.getElementById("time").value
  };

  data.push(r);
  localStorage.setItem("randevu", JSON.stringify(data));
  alert("Appointment saved 💖");
}

function login(){
  let pass = document.getElementById("pass").value;

  if(pass === "1234"){
    let list = document.getElementById("list");
    list.innerHTML = "";

    data.forEach(r=>{
      list.innerHTML += `<li>${r.name} - ${r.phone} - ${r.service} - ${r.date} ${r.time}</li>`;
    });
  } else {
    alert("Wrong password");
  }
}
