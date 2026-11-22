const PSK = "CioSIDnqwYGUWP-53fMJ5ZQVg78z2xBfs8AGHWDjX4eXJ-jdGgROZXdzKAE";
const CHANNEL_URL = `https://meshtastic.org/e/?add=true#${PSK}`;

const main = async () => {
    document.getElementById("copyLink").addEventListener("click", async () => {
        const button = document.getElementById("copyLink");
        try {
            await navigator.clipboard.writeText(CHANNEL_URL);
            button.textContent = "Copied!";
            setTimeout(() => (button.textContent = "Copy channel link"), 1800);
        } catch (err) {
            window.prompt("Copy this Meshtastic channel link:", CHANNEL_URL);
        }
    });

    document.getElementById("channelUrl").innerHTML = CHANNEL_URL;

    new QRCode(document.getElementById("qrcode"), {
        text: CHANNEL_URL,
        width: 280,
        height: 280,
        correctLevel: QRCode.CorrectLevel.M,
    });
};

main();
