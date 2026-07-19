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

  // Global listeler
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
      const zipContent = await zip.loadAsync(file);

      for (let relativePath in zipContent.files) {
        const currentFile = zipContent.files[relativePath];

        // 1. Takipçiler Dosyası
        if (relativePath.includes('followers_1.json')) {
          const text = await currentFile.async("text");
          const data = JSON.parse(text);
          followersList = data.map(item => item.string_list_data[0].value);
        } else if (relativePath.includes('followers_1.html')) {
          const text = await currentFile.async("text");
          followersList = parseInstagramHtml(text);
        }

        // 2. Takip Edilenler Dosyası
        if (relativePath.includes('following.json')) {
          const text = await currentFile.async("text");
          const data = JSON.parse(text);
          followingList = data.relationships_following.map(item => item.string_list_data[0].value);
        } else if (relativePath.includes('following.html')) {
          const text = await currentFile.async("text");
          followingList = parseInstagramHtml(text);
        }
      }

      if (followersList.length === 0 && followingList.length === 0) {
        alert("ZIP dosyası içinde takip verisi bulunamadı. Lütfen orijinal dosyayı yükleyin.");
        return;
      }

      const followersSet = new Set(followersList);
      const followingSet = new Set(followingList);

      // Listeleri hesapla
      currentNotFollowingBackList = followingList.filter(user => !followersSet.has(user));
      const youDontFollowList = followersList.filter(user => !followingSet.has(user));

      // Sayaçları yazdır
      if (followersCountEl) followersCountEl.textContent = followersList.length;
      if (followingCountEl) followingCountEl.textContent = followingList.length;
      if (notFollowingCountEl) notFollowingCountEl.textContent = currentNotFollowingBackList.length;
      if (youDontFollowCountEl) youDontFollowCountEl.textContent = youDontFollowList.length;

      if (searchInput) searchInput.value = "";
      renderList(currentNotFollowingBackList);

    } catch (e) {
      console.error(e);
      alert("ZIP dosyası işlenirken bir hata oluştu.");
    }
  });

  function renderList(users) {
    list.innerHTML = "";

    if (users.length === 0) {
      list.innerHTML = "<li>Kullanıcı bulunamadı.</li>";
      return;
    }

    // Ekran görüntüsündeki yuvarlak siyah kapsüllerin (li) düzgün görünmesi için içini metinle dolduruyoruz
    users.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  // Arama özelliği
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      const filteredUsers = currentNotFollowingBackList.filter(user => 
        user.toLowerCase().includes(searchTerm)
      );
      renderList(filteredUsers);
    });
  }

  // 🌟 GÜNCELLENEN CSV İNDİRME MANTIĞI
  if (downloadCsvBtn) {
    downloadCsvBtn.onclick = function() {
      if (!currentNotFollowingBackList || currentNotFollowingBackList.length === 0) {
        alert("İndirilecek analiz sonucu bulunamadı. Lütfen önce ZIP dosyanızı analiz edin.");
        return;
      }

      // Excel uyumlu CSV metni oluşturma
      let csvContent = "\uFEFFKullanıcı Adı\n"; 
      currentNotFollowingBackList.forEach(user => {
        csvContent += user + "\n";
      });

      // Tarayıcılarda indirmeyi zorlayan veri tipi (Blob)
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      
      // Modern indirme tetikleyici
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "insta_insight_takip_etmeyenler.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Eski mobil tarayıcılar için yedek yöntem
        window.open(encodeURI("data:text/csv;charset=utf-8," + csvContent));
      }
    };
  }
});

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
