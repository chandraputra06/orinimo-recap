
import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

import pencil from "@iconify-icons/lucide/pencil";
import trash2 from "@iconify-icons/lucide/trash-2";
import x from "@iconify-icons/lucide/x";
import check from "@iconify-icons/lucide/check";
import bell from "@iconify-icons/lucide/bell";
import loaderCircle from "@iconify-icons/lucide/loader-circle";

import {
  addDays,
  cleanRecord,
  dueDate,
  status,
  today,
} from "../../shared/domain.js";

import { Service } from "../Visuals.jsx";
import Mascot from "./Mascot.jsx";

const dateLabel = (value) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value + "T00:00:00"))
    : "Belum diatur";

// ==========================================
// TABEL REKAP CANVA
// ==========================================

export function CanvaTable({
  records,
  date,
  offset = 0,
  onEdit,
  onDelete,
}) {
  if (!records.length) {
    return (
      <div className="empty-state">
        <Mascot
          size={100}
          variant="calm"
          decorative
          className="mx-auto mb-3"
        />
        <h3>Belum ada akun Canva</h3>
        <p>Tambahkan akun Canva pertamamu melalui tombol Tambah akun.</p>
      </div>
    );
  }

  return (
    <div className="table-scroll">
      <table className="account-table">
        <thead>
          <tr>
            <th>NO.</th>
            <th>EMAIL</th>
            <th>TANGGAL DIBELI</th>
            <th>TANGGAL BERAKHIR</th>
            <th>DURASI</th>
            <th>DESIGNER</th>
            <th>STATUS</th>
            <th>AKSI</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record, index) => {
            const current = status(record, date);

            return (
              <tr key={record.id}>
                <td className="row-number">
                  {String(offset + index + 1).padStart(2, "0")}
                </td>

                <td>
                  <div className="account-cell">
                    <Service kind="canva" />
                    <span>
                      <strong>{record.email}</strong>
                      <small>Canva</small>
                    </span>
                  </div>
                </td>

                <td className="date-cell">
                  {dateLabel(record.tanggal_dibeli)}
                </td>

                <td className="date-cell">
                  {dateLabel(dueDate(record))}
                </td>

                <td>{record.durasi} hari</td>

                <td>
                  <span
                    className={`designer-tag ${
                      record.designer ? "yes" : "no"
                    }`}
                  >
                    {record.designer ? "Designer" : "Tidak"}
                  </span>
                </td>

                <td>
                  <span className={`badge ${current.tone}`}>
                    <i />
                    {current.label}
                  </span>
                </td>

                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Edit ${record.email}`}
                      onClick={() => onEdit(record)}
                    >
                      <Icon icon={pencil} width={16} height={16} />
                    </button>

                    <button
                      type="button"
                      className="icon-btn delete"
                      aria-label={`Hapus ${record.email}`}
                      onClick={() => onDelete(record)}
                    >
                      <Icon icon={trash2} width={16} height={16} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ==========================================
// MODAL TAMBAH / EDIT CANVA
// ==========================================

export function CanvaAccountModal({
  record = {},
  busy = false,
  onClose,
  onSave,
}) {
  const [form, setForm] = useState(() => ({
    kind: "canva",
    email: "",
    tanggal_dibeli: today(),
    tanggal_berakhir: addDays(today(), 30),
    durasi: 30,
    designer: false,
    ...record,
  }));

  const [auto, setAuto] = useState(!record.id);
  const [formError, setFormError] = useState("");
  const modalRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    modalRef.current?.querySelector("input")?.focus();

    function onKeyDown(event) {
      if (document.querySelector(".swal2-container")) return;

      if (event.key === "Escape" && !busy) {
        onClose();
      }

      if (event.key !== "Tab") return;

      const elements = Array.from(
        modalRef.current?.querySelectorAll(
          "button:not(:disabled),input:not(:disabled),select:not(:disabled)"
        ) || []
      ).filter((element) => element.offsetParent !== null);

      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus?.();
    };
  }, [busy, onClose]);

  function update(field, value) {
    if (field === "tanggal_berakhir") {
      setAuto(false);
    }

    setForm((previous) => {
      const next = { ...previous, [field]: value };

      if (
        auto &&
        ["tanggal_dibeli", "durasi"].includes(field)
      ) {
        next.tanggal_berakhir = addDays(
          next.tanggal_dibeli,
          Number(next.durasi)
        );
      }

      return next;
    });
  }

  function toggleAuto(checked) {
    setAuto(checked);

    if (checked) {
      setForm((previous) => ({
        ...previous,
        tanggal_berakhir: addDays(
          previous.tanggal_dibeli,
          Number(previous.durasi)
        ),
      }));
    }
  }

  function submit(event) {
    event.preventDefault();

    try {
      const data = cleanRecord({
        ...form,
        kind: "canva",
        designer: Boolean(form.designer),
      });

      setFormError("");
      onSave(data, record.id);
    } catch (error) {
      setFormError(
        error.issues?.map((issue) => issue.message).join(" ") ||
          error.message
      );
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) {
          onClose();
        }
      }}
    >
      <section
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={record.id ? "Edit Canva" : "Tambah Canva"}
        className="modal"
        data-lenis-prevent
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">ORINIMO WORKSPACE</span>
            <h2>
              {record.id ? "Edit akun Canva" : "Tambah akun Canva"}
            </h2>
            <p>Lengkapi informasi masa aktif Canva.</p>
          </div>

          <button
            type="button"
            className="icon-btn"
            aria-label="Tutup"
            disabled={busy}
            onClick={onClose}
          >
            <Icon icon={x} width={21} height={21} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-grid">
              <label className="span-two">
                Email akun <span className="required">*</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  placeholder="contoh@email.com"
                  onChange={(e) => update("email", e.target.value)}
                />
              </label>

              <label>
                Tanggal dibeli <span className="required">*</span>
                <input
                  type="date"
                  required
                  value={form.tanggal_dibeli || ""}
                  onChange={(e) =>
                    update("tanggal_dibeli", e.target.value)
                  }
                />
              </label>

              <label>
                Durasi (hari) <span className="required">*</span>
                <input
                  type="number"
                  min={1}
                  max={3650}
                  required
                  value={form.durasi}
                  onChange={(e) => update("durasi", e.target.value)}
                />
              </label>

              <label>
                Tanggal berakhir <span className="required">*</span>
                <input
                  type="date"
                  required
                  value={form.tanggal_berakhir || ""}
                  onChange={(e) =>
                    update("tanggal_berakhir", e.target.value)
                  }
                />
              </label>

              <label>
                Akses Designer
                <select
                  value={form.designer ? "ya" : "tidak"}
                  onChange={(e) =>
                    update("designer", e.target.value === "ya")
                  }
                >
                  <option value="tidak">Tidak (default)</option>
                  <option value="ya">Designer</option>
                </select>
              </label>
            </div>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={auto}
                onChange={(e) => toggleAuto(e.target.checked)}
              />
              Hitung otomatis tanggal berakhir dari tanggal dibeli + durasi
            </label>

            <div className="form-hint">
              <Icon icon={bell} width={16} height={16} />
              <span>
                Reminder Canva muncul mulai 3 hari sebelum
                tanggal berakhir.
              </span>
            </div>

            {formError && (
              <div role="alert" className="form-error">
                {formError}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn secondary"
              disabled={busy}
              onClick={onClose}
            >
              Batal
            </button>

            <button
              type="submit"
              className="btn primary"
              disabled={busy}
            >
              <Icon
                icon={busy ? loaderCircle : check}
                width={17}
                height={17}
                className={busy ? "spin" : ""}
              />
              {busy ? "Menyimpan..." : "Simpan akun"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
