document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

const cameraForm = document.querySelector("#camera-form");
const cameraVideo = document.querySelector("#camera-video");
const cameraMessage = document.querySelector("#camera-message");
const cameraName = document.querySelector("#camera-name");
let cameraStream;

if (cameraForm && cameraVideo) {
    cameraForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = cameraName.value.trim();

        if (!name || !document.querySelector("#camera-consent").checked) {
            cameraMessage.textContent = "Escribe tu nombre y acepta el consentimiento para continuar.";
            cameraMessage.className = "camera-message camera-message-error";
            return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
            cameraMessage.textContent = "Este navegador no permite usar la cámara aquí. Usa HTTPS o localhost.";
            cameraMessage.className = "camera-message camera-message-error";
            return;
        }

        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" },
                audio: false,
            });
            cameraVideo.srcObject = cameraStream;
            cameraVideo.classList.add("is-visible");
            document.querySelector("#camera-name-display").textContent = name;
            cameraMessage.textContent = "Cámara activa en este dispositivo. No se está grabando ni enviando el vídeo.";
            cameraMessage.className = "camera-message camera-message-success";
            document.querySelector("#camera-start").disabled = true;
        } catch (error) {
            cameraMessage.textContent = error.name === "NotAllowedError"
                ? "No se concedió el permiso de cámara. Puedes permitirlo desde los ajustes del navegador."
                : "No se pudo activar la cámara en este dispositivo.";
            cameraMessage.className = "camera-message camera-message-error";
        }
    });
}

window.addEventListener("beforeunload", () => {
    cameraStream?.getTracks().forEach((track) => track.stop());
});
