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
const cameraCopyRoom = document.querySelector("#camera-copy-room");
const cameraCopyLink = document.querySelector("#camera-copy-link");
let cameraStream;

if (cameraRoom) {
    const roomFromUrl = new URLSearchParams(window.location.search).get("sala");
    cameraRoom.value = /^\d{6}$/.test(roomFromUrl || "")
        ? roomFromUrl
        : String(Math.floor(100000 + Math.random() * 900000));
    window.history.replaceState({}, "", `${window.location.pathname}?sala=${cameraRoom.value}`);
}

cameraCopyRoom?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(cameraRoom.value);
    cameraCopyRoom.textContent = "Código copiado";
    window.setTimeout(() => { cameraCopyRoom.textContent = "Copiar código"; }, 1800);
});

cameraCopyLink?.addEventListener("click", async () => {
    await navigator.clipboard.writeText(window.location.href);
    cameraCopyLink.textContent = "Enlace copiado";
    window.setTimeout(() => { cameraCopyLink.textContent = "Copiar enlace"; }, 1800);
});

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
            peer.on("connection", (connection) => {
                connection.on("open", () => {
                    peer.call(connection.peer, cameraStream);
                });
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
    const roomFromUrl = new URLSearchParams(window.location.search).get("sala");
    if (/^\d{6}$/.test(roomFromUrl || "")) {
        viewerRoom.value = roomFromUrl;
    }

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
            const connection = peer.connect(`camera-${room}`);
            connection.on("open", () => {
                viewerMessage.textContent = "Visor conectado. Esperando el vídeo autorizado...";
            });
            connection.on("error", () => {
                viewerMessage.textContent = "No se encontró una cámara con ese código.";
                viewerMessage.className = "camera-message camera-message-error";
            });
        });
        peer.on("call", (call) => {
            call.answer();
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
        });
        peer.on("error", () => {
            viewerMessage.textContent = "No se encontró una cámara con ese código o la transmisión ya terminó.";
            viewerMessage.className = "camera-message camera-message-error";
        });
        viewerRoom.disabled = true;
    });
}
