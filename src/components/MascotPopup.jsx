const mascotImages = {
  success: {
    src: "/mascot/mascot-berhasil.png",
    alt: "Maskot Orinimo yang senang",
  },
  error: {
    src: "/mascot/mascot-gagal.png",
    alt: "Maskot Orinimo yang sedih",
  },
  warning: {
    src: "/mascot/bascot-bertanya.png",
    alt: "Maskot Orinimo sedang bertanya",
  },
};

export function mascotSweetAlertOptions(type = "warning", toast = false) {
  const mascot = mascotImages[type] || mascotImages.warning;

  return {
    imageUrl: mascot.src,
    imageWidth: toast ? 48 : 150,
    imageHeight: toast ? 48 : 150,
    imageAlt: mascot.alt,
    customClass: {
      popup: `ori-popup ori-mascot-swal ori-swal-${type}${toast ? " ori-mascot-toast" : ""}`,
      image: "ori-swal-mascot-image",
      confirmButton: "btn primary",
      cancelButton: "btn secondary",
      actions: "popup-actions",
    },
  };
}
