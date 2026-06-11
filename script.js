// Aura Coiffeur - Sayfa Geçişleri ve Buton Yönetimi

function showSection(sectionId) {
    // 1. Önce ekrandaki tüm içerik sayfalarını gizle
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    // 2. Sadece tıklanan butona ait olan ID'li sayfayı göster
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
        console.log(sectionId + " bölümü başarıyla yüklendi.");
    } else {
        console.error("Hata: '" + sectionId + "' ID'sine sahip bir sayfa bulunamadı!");
    }
}

// Sayfa ilk açıldığında çalışacak kodlar
document.addEventListener("DOMContentLoaded", () => {
    console.log("Aura Coiffeur Pro sistemi başarıyla yüklendi.");
});
