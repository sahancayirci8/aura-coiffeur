document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const userInp = document.getElementById("username").value;
            const passInp = document.getElementById("password").value;
            
            if (userInp === "admin" && passInp === "1234") {
                document.getElementById("login-screen").style.display = "none";
                document.getElementById("main-panel").style.display = "block";
                alert("Aura Coiffeur Sistemine Başarıyla Giriş Yapıldı!");
            } else {
                alert("Hatalı Kullanıcı Adı veya Şifre! Lütfen tekrar deneyin.");
            }
        });
    }
});
