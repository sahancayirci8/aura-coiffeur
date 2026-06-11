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
        alert("Erişim Engellendi! Hatalı Şifre.");
    }
}

function handleLogout() {
    document.getElementById('app-container').classList.remove('logged-in');
    document.getElementById('login-container').style.display = 'block';
}

// SAYFA GEÇİŞLERİ VE MENÜYÜ OTOMATİK KAPATMA
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.remove('active'));

    const active = document.getElementById(sectionId);
    if (active) {
        active.classList.add('active');
    }
    
    // Mobilde bir menüye tıklanınca menüyü otomatik geri kapat
    toggleSidebar(false);
}

// MOBİL MENÜ AÇMA / KAPATMA FONKSİYONU
function toggleSidebar(open) {
    const sidebar = document.getElementById('sidebar');
    if (open) {
        sidebar.classList.add('mobile-open');
    } else {
        sidebar.classList.remove('mobile-open');
    }
}

// ADİSYON SİNKRONİZASYONU
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

// ADİSYONU RESİM (PNG) OLARAK TELEFONA İNDİRME SİHRİ
function downloadReceiptPNG() {
    const receiptElement = document.getElementById('receipt-view');
    const customerName = document.getElementById('app-name').value || "musteri";
    
    // html2canvas kütüphanesini tetikliyoruz
    html2canvas(receiptElement, {
        backgroundColor: "#ffffff",
        scale: 2 // Resmin telefonda çok net çıkması için kaliteyi 2 kat artırır
    }).then(canvas => {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `Aura_Adisyon_${customerName.replace(/\s+/g, '_')}.png`;
        link.href = image;
        link.click();
    });
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

    alert("Adisyon Başarıyla Kaydedildi!");
    document.getElementById('appointment-form').reset();
    syncReceipt();
    updateAllTables();
    showSection('dashboard');
}

// TÜM SİSTEMİ VE TABLOLARI DOLDURMA
function updateAllTables() {
    const todayList = document.getElementById('today-appointments-list');
    const calendarList = document.getElementById('all-calendar-list');
    const customerList = document.getElementById('customer-list');
    const cashList = document.getElementById('cash-list');

    if(!todayList) return; // Eğer elementler henüz yüklenmediyse koruma

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
            <td>${app.name} (Premium Hizmet)</td>
            <td>${app.service}</td>
            <td style="color:#d4af37; font-weight:bold;">+ ₺${app.price}</td>
        </tr>`;

        totalCiro += app.price;
    });

    document.getElementById('stat-count').innerText = appointments.length;
    document.getElementById('stat-cash').innerText = "₺" + totalCiro;
    document.getElementById('total-cash-display').innerText = "₺" + totalCiro;
}
