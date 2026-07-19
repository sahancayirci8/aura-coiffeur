document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const fileInput = document.getElementById("zipInput");
  const list = document.getElementById("userList");
  const downloadCsvBtn = document.getElementById("downloadCsv");
  const searchInput = document.getElementById("search");

  // Arayüzdeki 4 adet sayaç elementi
  const followersCountEl = document.getElementById("followersCount");
  const followingCountEl = document.getElementById("followingCount");
  const notFollowingCountEl = document.getElementById("notFollowingCount");
  const youDontFollowCountEl = document.getElementById("youDontFollowCount");

  // Global listeler (CSV indirirken ve arama yaparken kullanmak için)
  let currentNotFollowingBackList = []; 
  let followersList = [];
  let followingList = [];

  analyzeBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];

    if (!file) {
      alert("Lütfen Instagram'dan indirdiğiniz ZIP dosyasını seçin.");
      return;
    }

    const zip = new JSZip();
    followersList = [];
    followingList = [];

    try {
      // ZIP dosyasını belleğe yükle
      const zipContent = await zip.loadAsync(file);

      // ZIP içindeki dosyaları tara
      for (let relativePath in zipContent.files) {
        const currentFile = zipContent.files[relativePath];

        // 1. Takipçiler Dosyasını Yakala
        if (relativePath.includes('followers_1.json')) {
          const text = await currentFile.async("text");
          const data = JSON.parse(text);
          followersList = data.map(item => item.string_list_data[0].value);
        } else if (relativePath.includes('followers_1.html')) {
          const text = await currentFile.async("text");
          followersList = parseInstagramHtml(text);
        }

        // 2. Takip Edilenler Dosyasını Yakala
        if (relativePath.includes('following.json')) {
          const text = await currentFile.async("text");
          const data = JSON.parse(text);
          followingList = data.relationships_following.map(item => item.string_list_data[0].value);
        } else if (relativePath.includes('following.html')) {
          const text = await currentFile.async("text");
          followingList = parseInstagramHtml(text);
        }
      }

      // Veri kontrolü
      if (followersList.length === 0 && followingList.length === 0) {
        alert("ZIP dosyası içinde takip verisi bulunamadı. Lütfen Instagram'dan indirdiğiniz orijinal dosyayı yükleyin.");
        return;
      }

      // KÜMELERİ OLUŞTUR
      const followersSet = new Set(followersList);
      const followingSet = new Set(followingList);

      // 1. Geri Takip Etmeyenler (Sen takip ediyorsun ama o seni etmiyor)
      currentNotFollowingBackList = followingList.filter(user => !followersSet.has(user));

      // 2. Seni Takip Etmeyenler / Geri Takip Etmediklerin (O seni takip ediyor ama sen onu etmiyorsun)
      const youDontFollowList = followersList.filter(user => !followingSet.has(user));

      // Arayüz Sayaçlarını Güncelle
      if (followersCountEl) followersCountEl.textContent = followersList.length;
      if (followingCountEl) followingCountEl.textContent = followingList.length;
      if (notFollowingCountEl) notFollowingCountEl.textContent = currentNotFollowingBackList.length;
      if (youDontFollowCountEl) youDontFollowCountEl.textContent = youDontFollowList.length;

      // Arama kutusunu temizle ve listeyi ekrana bas
      if (searchInput) searchInput.value = "";
      renderList(currentNotFollowingBackList);

    } catch (e) {
      console.error(e);
      alert("ZIP dosyası işlenirken bir hata oluştu.");
    }
  });

  // Ekrana listeyi basan fonksiyon
  function renderList(users) {
    list.innerHTML = "";

    if (users.length === 0) {
      list.innerHTML = "<li>Kullanıcı bulunamadı.</li>";
      return;
    }

    users.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  // 🌟 1. ARAMA KUTUSU FİLTRELEME ÖZELLİĞİ
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const filteredUsers = currentNotFollowingBackList.filter(user => 
        user.toLowerCase().includes(searchTerm)
      );
      renderList(filteredUsers);
    });
  }

  // 🌟 2. CSV İNDİRME ÖZELLİĞİ (Çalışmayan Butonun Kodu)
  if (downloadCsvBtn) {
    downloadCsvBtn.addEventListener("click", () => {
      if (currentNotFollowingBackList.length === 0) {
        alert("İndirilecek analiz sonucu bulunamadı. Lütfen önce analizi başlatın.");
        return;
      }

      // CSV İçeriğini Hazırla (Türkçe karakter sorunu olmaması için BOM ekliyoruz)
      let csvContent = "\uFEFF"; 
      csvContent += "Seni Takip Etmeyen Kullanıcılar\n";
      
      currentNotFollowingBackList.forEach(user => {
        csvContent += `${user}\n`;
      });

      // İndirme işlemini tetikle
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", "insta_insight_sonuclar.csv");
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
});

// HTML formatındaki veriler için yardımcı fonksiyon
function parseInstagramHtml(htmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const links = doc.querySelectorAll('a');
  const names = [];
  links.forEach(link => {
    const name = link.textContent.trim();
    if (name && !name.includes('http') && name !== "Instagram") {
      names.push(name);
    }
  });
  return names;
}
