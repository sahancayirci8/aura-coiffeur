document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const fileInput = document.getElementById("zipInput");
  const list = document.getElementById("userList");

  analyzeBtn.addEventListener("click", async () => {
    const file = fileInput.files[0];

    if (!file) {
      alert("Lütfen bir JSON dosyası seçin.");
      return;
    }

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data.listA) || !Array.isArray(data.listB)) {
        alert("JSON içinde listA ve listB dizileri bulunmalıdır.");
        return;
      }

      const setB = new Set(data.listB);

      const onlyInA = data.listA.filter(item => !setB.has(item));

      list.innerHTML = "";

      if (onlyInA.length === 0) {
        list.innerHTML = "<li>Fark bulunamadı.</li>";
        return;
      }

      onlyInA.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        list.appendChild(li);
      });

    } catch (e) {
      console.error(e);
      alert("Dosya okunamadı.");
    }
  });
});
