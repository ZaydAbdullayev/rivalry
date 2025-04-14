import html2canvas from "html2canvas";

export const getCardAsImageData = async (cardEl) => {
    const canvas = await html2canvas(cardEl, {
        backgroundColor: null,
        useCORS: true,
        scale: 2,
    });
    return canvas.toDataURL("image/png"); // base64 string döner
};

export const uploadToImgbb = async (base64Data) => {
    const form = new FormData();
    form.append("image", base64Data.split(",")[1]);

    const response = await fetch("https://api.imgbb.com/1/upload?key=0c6e7cd171cc73ee4e6dfcfaf2cc0bd9", {
        method: "POST",
        body: form,
    });

    const data = await response.json();
    return data.data?.url; // işte bu senin paylaşılabilir linkin
};


export const saveCardAsImage = async (cardElement) => {

    if (!cardElement) {
        console.error("🎯 element bulunamadı!");
        return;
    }

    try {
        const canvas = await html2canvas(cardElement, {
            backgroundColor: null, // şeffaf arka plan için
            scale: 2, // daha kaliteli görüntü
            useCORS: true // harici img'ler için (örn. logo vs)
        });

        const dataURL = canvas.toDataURL("image/png");

        // Galeriye kaydedilsin: kullanıcıya indirme ver
        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "military_card.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("💥 Kart görsele çevrilemedi:", error);
    }
};
