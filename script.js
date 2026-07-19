document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const fileInput = document.getElementById("zipInput");
  const list = document.getElementById("userList");

  // Arayüzdeki sayaç elementlerini de güncellemek istersen ID'lerini buraya bağlayabilirsin
  const followersCountEl = document.getElementById("followersCount"); // Varsa HTML'de id="followersCount" yapın
  const followingCountEl = document.getElementById("followingCount"); // Varsa HTML'de id="followingCount" yapın
  const notFollowingCountEl = document.getElementById("notFollowingCount"); // Varsa HTML'de id="notFollowingCount" yapın

  analyzeBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];

    if (!file) {
      alert("Lütfen Instagram'dan indirdiğiniz ZIP dosyasını seçin.");
      return;
    }

    const zip = new JSZip();
    let followersList = [];
    let followingList = [];

    try {
      // 1. ZIP dosyasını belleğe yükle
      const zipContent = await zip.loadAsync(file);

      // 2. ZIP içindeki dosyaları tek tek tara
      for (let relativePath in zipContent.files) {
        const currentFile = zipContent.files[relativePath];

        // Takipçiler dosyasını bul (JSON formatı için)
        if (relativePath.includes('followers_1.json')) {
          const text = await currentFile.async("text");
          const data = JSON.parse(text);
          // Instagram'ın güncel JSON yapısından kullanıcı adlarını ayıkla
          followersList = data.map(item => item.string_list_data[0].value);
        } 
        // Takipçiler dosyasını bul (HTML formatı için yedek)
        else if (relativePath.includes('followers_1.html')) {
          const text = await currentFile.async("text");
          followersList = parseInstagramHtml(text);
        }

        // Takip edilenler dosyasını bul (JSON formatı için)
        if (relativePath.includes('following.json')) {
          const text = await currentFile.async("text");
          const data = JSON.parse(text);
          // Instagram'ın güncel JSON yapısından takip edilenleri ayıkla
          followingList = data.relationships_following.map(item => item.string_list_data[0].value);
        } 
        // Takip edilenler dosyasını bul (HTML formatı için yedek)
        else if (relativePath.includes('following.html')) {
          const text = await currentFile.async("text");
          followingList = parseInstagramHtml(text);
        }
      }

      // 3. Dosyalar doğru şekilde okunabildi mi kontrol et
      if (followersList.length === 0 && followingList.length === 0) {
        alert("ZIP dosyası içerisinde geçerli Instagram takip verisi bulunamadı. Lütfen orijinal dosyayı yüklediğinizden emin olun.");
        return;
      }

      // 4. Analizi Gerçekleştir (Seni Geri Takip Etmeyenler)
      const followersSet = new Set(followersList);
      const notFollowingBack = followingList.filter(user => !followersSet.has(user));

      // 5. Arayüzü Güncelle
      list.innerHTML = "";

      // İsteğe bağlı: Eğer arayüzde sayıları gösterdiğin kutular varsa onları güncelle
      if (followersCountEl) followersCountEl.textContent = followersList.length;
      if (followingCountEl) followingCountEl.textContent = followingList.length;
      if (notFollowingCountEl) notFollowingCountEl.textContent = notFollowingBack.length;

      if (notFollowingBack.length === 0) {
        list.innerHTML = "<li>Harika! Seni takip etmeyen kimse yok.</li>";
        return;
      }

      // Listeyi ekrana bas
      notFollowingBack.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });

    } catch (e) {
      console.error(e);
      alert("ZIP dosyası işlenirken bir hata oluştu. Dosyanın bozuk olmadığından emin olun.");
    }
  });
});

// Instagram veriyi HTML formatında indirdiyse kullanıcı adlarını ayıklayan yardımcı fonksiyon
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
