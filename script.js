// Aura Coiffeur Pro

const today = document.getElementById("today");
const clock = document.getElementById("clock");
const appointmentList = document.getElementById("appointmentList");
const appointmentCount = document.getElementById("appointmentCount");

let appointments = JSON.parse(localStorage.getItem("auraAppointments")) || [];

function updateClock() {
    const now = new Date();

    const date = now.toLocaleDateString("tr-TR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    const time = now.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit"
    });

    today.innerHTML = date;
    clock.innerHTML = time;
}

setInterval(updateClock, 1000);
updateClock();

function renderAppointments() {

    appointmentList.innerHTML = "";

    appointmentCount.innerHTML = appointments.length;

    if (appointments.length === 0) {

        appointmentList.innerHTML =
        "<p>Henüz randevu eklenmedi.</p>";

        return;
    }

    appointments.forEach((item, index) => {

        appointmentList.innerHTML += `

        <div class="appointmentCard">

            <h3>${item.name}</h3>

            <p>${item.service}</p>

            <p>${item.date} - ${item.time}</p>

            <button onclick="deleteAppointment(${index})">

            Sil

            </button>

        </div>

        `;

    });

}

function addSampleData() {

    if (appointments.length === 0) {

        appointments.push({

            name: "Örnek Müşteri",

            service: "Saç Kesimi",

            date: "Bugün",

            time: "10:00"

        });

        localStorage.setItem(
            "auraAppointments",
            JSON.stringify(appointments)
        );

    }

}

function deleteAppointment(index) {

    appointments.splice(index,1);

    localStorage.setItem(
        "auraAppointments",
        JSON.stringify(appointments)
    );

    renderAppointments();

}

addSampleData();

renderAppointments();
