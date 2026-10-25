import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
const base = {
  confirmButtonColor: "#7b1e1e",
  cancelButtonColor: "#697284",
  buttonsStyling: false,
  customClass: {
    popup: "ori-popup",
    confirmButton: "btn primary",
    cancelButton: "btn secondary",
    actions: "popup-actions",
  },
  showClass: { popup: "popup-in" },
  hideClass: { popup: "popup-out" },
  heightAuto: false,
};
export const success = (title, text) =>
  Swal.fire({
    ...base,
    icon: "success",
    title,
    text,
    confirmButtonText: "Oke, mengerti",
  });
export const failure = (e) =>
  Swal.fire({
    ...base,
    icon: "error",
    title: "Belum berhasil",
    text: e.message || String(e),
    confirmButtonText: "Coba lagi",
  });
export const confirm = (title, text, button = "Ya, lanjutkan") =>
  Swal.fire({
    ...base,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: button,
    cancelButtonText: "Batal",
    reverseButtons: true,
  });
export const toast = (title) =>
  Swal.fire({
    ...base,
    toast: true,
    position: "top-end",
    icon: "success",
    title,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  });
