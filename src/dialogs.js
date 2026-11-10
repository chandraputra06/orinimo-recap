import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import { mascotSweetAlertOptions } from "./components/MascotPopup.jsx";

const base = {
  confirmButtonColor: "#7b1e1e",
  cancelButtonColor: "#697284",
  buttonsStyling: false,
  showClass: { popup: "popup-in" },
  hideClass: { popup: "popup-out" },
};
const modalBase = { ...base, heightAuto: false };
export const success = (title, text) =>
  Swal.fire({
    ...modalBase,
    ...mascotSweetAlertOptions("success"),
    title,
    text,
    confirmButtonText: "Oke, mengerti",
  });
export const failure = (e) =>
  Swal.fire({
    ...modalBase,
    ...mascotSweetAlertOptions("error"),
    title: "Belum berhasil",
    text: e.message || String(e),
    confirmButtonText: "Coba lagi",
  });
export const confirm = (title, text, button = "Ya, lanjutkan") =>
  Swal.fire({
    ...modalBase,
    ...mascotSweetAlertOptions("warning"),
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
    ...mascotSweetAlertOptions("success", true),
    toast: true,
    position: "top-end",
    title,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  });
