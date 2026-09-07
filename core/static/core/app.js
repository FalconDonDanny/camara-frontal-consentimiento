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
const cameraRoom = document.querySelector("#camera-room");
let cameraStream;

if (cameraForm && cameraVideo) {
    cameraForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const name = cameraName.value.trim();
        const room = cameraRoom.value.trim();

        if (!name || !/^\d{6}$/.test(room) || !document.querySelector("#camera-consent").checked) {
            cameraMessage.textContent = "Escribe tu nombre, un código de 6 cifras y acepta el consentimiento.";
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
            const peer = new Peer(`camera-${room}`);
            peer.on("open", () => {
                cameraMessage.textContent = `Cámara activa. Comparte el código ${room} con el visor autorizado.`;
            });
            peer.on("call", (call) => {
                call.answer(cameraStream);
            });
            peer.on("error", () => {
                cameraMessage.textContent = "No se pudo abrir la sala. Comprueba que el código no esté en uso.";
                cameraMessage.className = "camera-message camera-message-error";
            });
            cameraMessage.className = "camera-message camera-message-success";
            document.querySelector("#camera-start").disabled = true;
            cameraRoom.disabled = true;
            cameraName.disabled = true;
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

const viewerForm = document.querySelector("#viewer-form");
const viewerVideo = document.querySelector("#viewer-video");
const viewerRoom = document.querySelector("#viewer-room");
const viewerMessage = document.querySelector("#viewer-message");

if (viewerForm && viewerVideo) {
    viewerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const room = viewerRoom.value.trim();

        if (!/^\d{6}$/.test(room)) {
            viewerMessage.textContent = "Introduce un código de sala de 6 cifras.";
            viewerMessage.className = "camera-message camera-message-error";
            return;
        }

        const peer = new Peer();
        peer.on("open", () => {
            const call = peer.call(`camera-${room}`, new MediaStream());
            call.on("stream", (stream) => {
                viewerVideo.srcObject = stream;
                viewerVideo.classList.add("is-visible");
                document.querySelector("#viewer-placeholder").style.display = "none";
                viewerMessage.textContent = "Transmisión conectada. La persona emisora puede detenerla en cualquier momento.";
                viewerMessage.className = "camera-message camera-message-success";
            });
            call.on("close", () => {
                viewerMessage.textContent = "La persona emisora cerró la transmisión.";
            });
            viewerMessage.textContent = "Buscando la cámara autorizada...";
        });
        peer.on("error", () => {
            viewerMessage.textContent = "No se encontró una cámara con ese código o la transmisión ya terminó.";
            viewerMessage.className = "camera-message camera-message-error";
        });
        viewerRoom.disabled = true;
    });
}
