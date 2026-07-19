let followersList = [];
let followingList = [];
let notFollowingBack = [];

// Dosya Seçim Göstergeleri
document.getElementById('followersFile').addEventListener('change', function(e) {
    if(e.target.files[0]) document.getElementById('followersLabel').textContent = e.target.files[0].name;
});
document.getElementById('followingFile').addEventListener('change', function(e) {
    if(e.target.files[0]) document.getElementById('followingLabel').textContent = e.target.files[0].name;
});

// Otomatik Analiz Butonu Mantığı
document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const file1 = document.getElementById('followersFile').files[0];
    const file2 = document.getElementById('followingFile').files[0];

    if (!file1 || !file2) {
        alert("Lütfen hem followers.json hem de following.json dosyalarını yükleyin!");
        return;
    }

    try {
        followersList = JSON.parse(await file1.text());
        followingList = JSON.parse(await file2.text());

        // Eşleştirme Yapıp Seni Takip Etmeyenleri Bulma
        notFollowingBack = followingList.filter(user => !followersList.includes(user));

        // Ekran Sayaçlarını Güncelleme
        document.getElementById('followersCount').textContent = followersList.length;
        document.getElementById('followingCount').textContent = followingList.length;
        document.getElementById('notFollowingCount').textContent = notFollowingBack.length;

        // Listeyi Ekrana Basma
        updateList(notFollowingBack);

    } catch (error) {
        alert("Dosyalar okunurken hata oluştu. Lütfen doğru listeleri yüklediğinizden emin olun.");
    }
});

// Ekranda Kullanıcıları Listeleme Fonksiyonu
function updateList(users) {
    const userListElement = document.getElementById('userList');
    userListElement.innerHTML = '';

    if (users.length === 0) {
        userListElement.innerHTML = '<li>Harika! Herkes seni geri takip ediyor.</li>';
        return;
    }

    users.forEach(username => {
        const li = document.createElement('li');
        li.textContent = username;
        userListElement.appendChild(li);
    });
}

// Canlı Arama Filtresi
document.getElementById('search').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = notFollowingBack.filter(user => user.toLowerCase().includes(query));
    updateList(filtered);
});

// CSV Çıktısı Alma Mobil Uyumlu Fonksiyon
document.getElementById('downloadCsv').addEventListener('click', () => {
    if (notFollowingBack.length === 0) {
        alert("İndirilecek veri bulunamadı.");
        return;
    }

    let csvContent = "\uFEFFKullanici Adi\n";
    notFollowingBack.forEach(user => {
        csvContent += `${user}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "beni_takip_etmeyenler.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});
