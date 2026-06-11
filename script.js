// Giriş Yapma Fonksiyonu
function handleLogin(event) {
    event.preventDefault(); // Sayfanın yenilenmesini engelle
    
    // Giriş ekranını gizle
    document.getElementById('login-container').style.display = 'none';
    
    // Ana panel yapısını görünür yap
    const appContainer = document.getElementById('app-container');
    appContainer.classList.add('logged-in');
    
    // Varsayılan olarak anasayfayı (dashboard) göster
    showSection('dashboard');
}

// Çıkış Yapma Fonksiyonu
function handleLogout() {
    // Ana paneli gizle
    const appContainer = document.getElementById('app-container');
    appContainer.classList.remove('logged-in');
    
    // Giriş ekranını tekrar göster
    document.getElementById('login-container').style.display = 'block';
}

// Sayfalar Arası Geçiş Fonksiyonu
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });

    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
        console.log(sectionId + " bölümü yüklendi.");
    }
}
