// Sayfa hafızasında randevuları tutmak için dizi (Boşsa yerel hafızadan yükler)
let appointments = JSON.parse(localStorage.getItem('aura_appointments')) || [];

// Giriş Fonksiyonu
function handleLogin(event) {
    event.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;

    if (u === "admin" && p === "1234") {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').classList.add('logged-in');
        showSection('dashboard');
        updateAllTables(); // Giriş yapınca tabloları doldur
    } else {
        alert("Hatalı giriş! (Kullanıcı adı: admin , Şifre: 1234)");
    }
}

// Çıkış Fonksiyonu
function handleLogout() {
    document.getElementById('app-container').classList.remove('logged-in');
    document.getElementById('login-container').style.display = 'block';
}

// Menü Geçiş Fonksiyonu
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.classList.remove('active'));

    const active = document.getElementById(sectionId);
    if (active) active.classList.add('active');
}

// YENİ RANDEVU KAYDETME FONKSİYONU
function saveAppointment(event) {
    event.preventDefault();

    // Formdaki verileri al
    const name = document.getElementById('app-name').value;
    const phone = document.getElementById('app-phone').value;
    const date = document.getElementById('app-date').value;
    const service = document.getElementById('app-service').value;
    const price = document.getElementById('app-price').value;

    // Yeni randevu objesi oluştur
    const newApp = { name, phone, date, service, price: parseFloat(price) };

    // Listeye ekle ve hafızaya kaydet
    appointments.push(newApp);
    localStorage.setItem('aura_appointments', JSON.stringify(appointments));

    // Formu temizle ve kullanıcıyı bilgilendir
    document.getElementById('appointment-form').reset();
    alert("Randevu başarıyla kaydedildi!");

    // Tüm tabloları ve paneli güncelle, anasayfaya dön
    updateAllTables();
    showSection('dashboard');
}

// TÜM BÖLÜMLERİ VE TABLOLARI GÜNCELLEME SİSTEMİ
function updateAllTables() {
    const todayList = document.getElementById('today-appointments-list');
    const calendarList = document.getElementById('all-calendar-list');
    const customerList = document.getElementById('customer-list');
    const cashList = document.getElementById('cash-list');

    // Tabloları temizle
    todayList.innerHTML = "";
    calendarList.innerHTML = "";
    customerList.innerHTML = "";
    cashList.innerHTML = "";

    let totalCiro = 0;

    appointments.forEach(app => {
        // Tarih formatını güzelleştirme
        const formattedDate = app.date.replace('T', ' ');

        // 1. Tablo: Bugünün / Tüm Randevuların Listesi (Anasayfa)
        const row = `<tr>
            <td><b>${app.name}</b></td>
            <td>${app.phone}</td>
            <td>📅 ${formattedDate}</td>
            <td>${app.service}</td>
            <td><span style="color:green; font-weight:bold;">₺${app.price}</span></td>
        </tr>`;
        todayList.innerHTML += row;
        calendarList.innerHTML += row; // Aynı veriyi takvime de basıyoruz

        // 2. Tablo: Müşteriler Listesi
        const customerRow = `<tr>
            <td>👤 <b>${app.name}</b></td>
            <td>${app.phone}</td>
            <td>${formattedDate}</td>
        </tr>`;
        customerList.innerHTML += customerRow;

        // 3. Tablo: Kasa Listesi
        const cashRow = `<tr>
            <td>${app.name} - Randevu Tahsilatı</td>
            <td>${app.service}</td>
            <td style="color:green; font-weight:bold;">+ ₺${app.price}</td>
        </tr>`;
        cashList.innerHTML += cashRow;

        totalCiro += app.price;
    });

    // İstatistik ve Sayaç Kartlarını Güncelle
    document.getElementById('stat-count').innerText = appointments.length;
    document.getElementById('stat-cash').innerText = "₺" + totalCiro;
    document.getElementById('total-cash-display').innerText = "₺" + totalCiro;
}
