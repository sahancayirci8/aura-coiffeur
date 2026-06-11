let appointments = JSON.parse(localStorage.getItem('aura_appointments')) || [];

function handleLogin(event) {
    event.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    if (u === "admin" && p === "1234") {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').classList.add('logged-in');
        showSection('dashboard');
        updateAllTables();
    } else {
        alert("Erişim Reddedildi! Gold şifreyi giriniz.");
    }
}

function handleLogout() {
    document.getElementById('app-container').classList.remove('logged-in');
    document.getElementById('login-container').style.display = 'block';
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.remove('active'));

    const active = document.getElementById(sectionId);
    if (active) active.classList.add('active');
}

// ADİSYONU CANLI OLARAK HTML FORMUNA EŞZAMANLAMA (TATLI EFEKT)
function syncReceipt() {
    const name = document.getElementById('app-name').value || "Müşteri Seçilmedi";
    const date = document.getElementById('app-date').value || "--.--.---- --:--";
    const service = document.getElementById('app-service').value;
    const price = document.getElementById('app-price').value || "0";

    document.getElementById('rec-name').innerText = name;
    document.getElementById('rec-date').innerText = date.replace('T', ' ');
    document.getElementById('rec-service').innerText = service;
    document.getElementById('rec-price').innerText = "₺" + price;
    document.getElementById('rec-total').innerText = "₺" + price;
}

// ADİSYONU KAYDETME VE KASAYA AKTARMA
function generateReceipt(event) {
    event.preventDefault();

    const name = document.getElementById('app-name').value;
    const phone = document.getElementById('app-phone').value;
    const date = document.getElementById('app-date').value;
    const service = document.getElementById('app-service').value;
    const price = document.getElementById('app-price').value;

    const newApp = { name, phone, date, service, price: parseFloat(price) };
    appointments.push(newApp);
    localStorage.setItem('aura_appointments', JSON.stringify(appointments));

    alert("Adisyon Onaylandı! VIP Hizmet Kasaya İşlendi.");
    document.getElementById('appointment-form').reset();
    syncReceipt(); // Adisyonu sıfırla
    updateAllTables();
    showSection('dashboard');
}

// TÜM SİSTEMİ GÜNCELLEME
function updateAllTables() {
    const todayList = document.getElementById('today-appointments-list');
    const calendarList = document.getElementById('all-calendar-list');
    const customerList = document.getElementById('customer-list');
    const cashList = document.getElementById('cash-list');

    todayList.innerHTML = "";
    calendarList.innerHTML = "";
    customerList.innerHTML = "";
    cashList.innerHTML = "";

    let totalCiro = 0;

    appointments.forEach(app => {
        const formattedDate = app.date.replace('T', ' ');

        const row = `<tr>
            <td><b>${app.name}</b></td>
            <td>${app.phone}</td>
            <td>${formattedDate}</td>
            <td class="gold-text">${app.service}</td>
            <td><b>₺${app.price}</b></td>
        </tr>`;
        
        todayList.innerHTML += row;
        calendarList.innerHTML += row;

        customerList.innerHTML += `<tr>
            <td>👤 <b>${app.name}</b></td>
            <td>${app.phone}</td>
            <td>${formattedDate}</td>
        </tr>`;

        cashList.innerHTML += `<tr>
            <td>${app.name} (Premium Ciro)</td>
            <td>${app.service}</td>
            <td style="color:#d4af37; font-weight:bold;">+ ₺${app.price}</td>
        </tr>`;

        totalCiro += app.price;
    });

    document.getElementById('stat-count').innerText = appointments.length;
    document.getElementById('stat-cash').innerText = "₺" + totalCiro;
    document.getElementById('total-cash-display').innerText = "₺" + totalCiro;
}
