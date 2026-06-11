// LocalStorage Veri Tabanı Başlatma
let appointments = JSON.parse(localStorage.getItem('aura_appointments')) || [];

// GÜVENLİ GİRİŞ KONTROLÜ
function handleLogin(event) {
    event.preventDefault();
    const u = document.getElementById('username').value.trim();
    const p = document.getElementById('password').value;

    if (u === "admin" && p === "1234") {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'flex';
        showSection('dashboard');
        updateAllTables();
    } else {
        alert("Erişim Engellendi! Geçersiz VIP Giriş Bilgileri.");
    }
}

// PANEL ÇIKIŞI
function handleLogout() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('login-container').style.display = 'flex';
    document.getElementById('login-form').reset();
}

// SEKMELER ARASI GEÇİŞ MOTORU
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(s => s.style.display = 'none');

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
    
    // Sol menü aktif buton rengini eşitleme
    const menuButtons = document.querySelectorAll('.menu-btn');
    menuButtons.forEach(btn => btn.classList.remove('active'));
    
    const targetBtn = document.getElementById(`btn-${sectionId}`);
    if (targetBtn) targetBtn.classList.add('active');

    // Mobilde tıklandıysa menüyü otomatik kapat
    toggleSidebar(false);
}

// MOBİL YAN MENÜ AÇMA / KAPATMA
function toggleSidebar(open) {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        if (open) sidebar.classList.add('mobile-open');
        else sidebar.classList.remove('mobile-open');
    }
}

// DIJITAL ADISYON ANLIK YAZI EŞİTLEME (SAYFA İÇİ REAKSİYON)
function syncReceipt() {
    const name = document.getElementById('app-name').value || "Müşteri Seçilmedi";
    const date = document.getElementById('app-date').value || "--.--.---- --:--";
    const service = document.getElementById('app-service').value;
    const price = document.getElementById('app-price').value || "0";

    document.getElementById('rec-name').innerText = name;
    document.getElementById('rec-date').innerText = date.replace('T', ' ');
    document.getElementById('rec-service').innerText = service;
    document.getElementById('rec-total').innerText = "₺" + parseFloat(price).toLocaleString('tr-TR');
}

// 📸 KUSURSUZ RESİM YAKALAMA VE TELEFONA İNDİRME MOTORU
function downloadReceiptPNG() {
    const receiptElement = document.getElementById('receipt-view');
    const customerName = document.getElementById('app-name').value || "VIP_Musteri";
    
    // Cihaz ekranı ne olursa olsun adisyonun kaymasını engelleyen stüdyo modu ayarı
    html2canvas(receiptElement, {
        backgroundColor: null,
        scale: 3, // Ultra HD Keskinlik
        logging: false,
        useCORS: true,
        width: 340,
        height: 480
    }).then(canvas => {
        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.download = `Aura_Adisyon_${customerName.replace(/\s+/g, '_')}.png`;
        link.href = image;
        link.click();
    }).catch(err => {
        alert("Görsel oluşturulurken bir hata meydana geldi.");
        console.error(err);
    });
}

// YENİ ADİSYON KAYDETME VE BARKODLAMA
function generateReceipt(event) {
    event.preventDefault();

    const name = document.getElementById('app-name').value.trim();
    const phone = document.getElementById('app-phone').value.trim();
    const date = document.getElementById('app-date').value;
    const service = document.getElementById('app-service').value;
    const price = document.getElementById('app-price').value;

    const id = Date.now(); // Benzersiz kimlik
    const newAppointment = { id, name, phone, date, service, price: parseFloat(price) };
    
    appointments.push(newAppointment);
    localStorage.setItem('aura_appointments', JSON.stringify(appointments));

    alert("Premium Adisyon Başarıyla Veritabanına İşlendi!");
    
    document.getElementById('appointment-form').reset();
    syncReceipt();
    updateAllTables();
    showSection('dashboard');
}

// ADİSYON İPTAL SİLME MEKANİZMASI
function deleteAppointment(id) {
    if (confirm("Bu VIP adisyon kaydını iptal etmek istediğinize emin misiniz? Tüm finansal veriler ve ciro anlık düşürülecektir.")) {
        appointments = appointments.filter(app => app.id !== id);
        localStorage.setItem('aura_appointments', JSON.stringify(appointments));
        updateAllTables();
    }
}

// VERİ AKIŞI VE TÜM TABLOLARIN ANLIK OLUŞTURULMASI
function updateAllTables() {
    const todayList = document.getElementById('today-appointments-list');
    const calendarList = document.getElementById('all-calendar-list');
    const customerList = document.getElementById('customer-list');
    const cashList = document.getElementById('cash-list');

    if (!todayList) return;

    // Temizlik
    todayList.innerHTML = "";
    calendarList.innerHTML = "";
    customerList.innerHTML = "";
    cashList.innerHTML = "";

    let totalCiro = 0;

    if (appointments.length === 0) {
        // Boş Durum Tasarımları (Empty States)
        const emptyRow = `<tr><td colspan="6" class="empty-state-text">Kayıtlı VIP Randevusu Bulunmamaktadır.</td></tr>`;
        todayList.innerHTML = emptyRow;
        
        const emptyCal = `<tr><td colspan="5" class="empty-state-text">Kayıtlı VIP Randevusu Bulunmamaktadır.</td></tr>`;
        calendarList.innerHTML = emptyCal;
        
        customerList.innerHTML = `<tr><td colspan="3" class="empty-state-text">Kayıtlı VIP Müşteri Bulunmamaktadır.</td></tr>`;
        cashList.innerHTML = `<tr><td colspan="4" class="empty-state-text">Henüz Kasa Hareketi Yok.</td></tr>`;
    } else {
        const uniqueCustomers = new Set();

        // Tarihe göre sıralama (En yeni randevu en üstte)
        appointments.sort((a, b) => new Date(a.date) - new Date(b.date));

        appointments.forEach(app => {
            const formattedDate = app.date.replace('T', ' ');
            const displayPrice = app.price.toLocaleString('tr-TR');

            // Ortak Satır Şablonu
            const rowTemplate = `<tr>
                <td><b>${app.name}</b></td>
                <td>${app.phone}</td>
                <td>${formattedDate}</td>
                <td class="gold-text">${app.service}</td>
                <td><b>₺${displayPrice}</b></td>
                <td><button onclick="deleteAppointment(${app.id})" style="background:#c0392b; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:11px; font-weight:500;">❌ İptal</button></td>
            </tr>`;
            
            todayList.innerHTML += rowTemplate;
            calendarList.innerHTML += rowTemplate;

            // VIP Müşteriler Listesi (Mükerrer isim engelleme filtresi)
            if (!uniqueCustomers.has(app.name.toLowerCase())) {
                uniqueCustomers.add(app.name.toLowerCase());
                customerList.innerHTML += `<tr>
                    <td>👤 <b>${app.name}</b></td>
                    <td>${app.phone}</td>
                    <td>${formattedDate}</td>
                </tr>`;
            }

            // Kasa Defteri Akışı
            cashList.innerHTML += `<tr>
                <td>${app.name}</td>
                <td>${app.service}</td>
                <td style="color:#d4af37; font-weight:600;">+ ₺${displayPrice}</td>
                <td><span style="color:#2ecc71; font-size:12px; font-weight:500;">● Tahsil Edildi</span></td>
            </tr>`;

            totalCiro += app.price;
        });
    }

    // İstatistik ve Kasa Kartı Senkronizasyonları
    document.getElementById('stat-count').innerText = appointments.length;
    document.getElementById('stat-cash').innerText = "₺" + totalCiro.toLocaleString('tr-TR');
    document.getElementById('total-cash-display').innerText = "₺" + totalCiro.toLocaleString('tr-TR');
}

// Dom hazır olduğunda otomatik çalıştır
document.addEventListener("DOMContentLoaded", () => {
    updateAllTables();
});
