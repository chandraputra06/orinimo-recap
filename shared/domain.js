import { z } from "zod";
export const kinds = ["netflix", "week", "disney"];
export const names = {
  netflix: "Netflix",
  week: "Netflix 1 Week",
  disney: "Disney+",
};
export const sharingTypes = [
  "1P1U 1 Bulan",
  "1P2U 1 Bulan",
  "1P1U 1 Week",
  "DIBELI",
  "7 HARI 1P1U",
];
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Makassar",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export function validDate(v) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(v) &&
    !Number.isNaN(Date.parse(v)) &&
    new Date(v + "T00:00:00Z").toISOString().slice(0, 10) === v
  );
}
export function addDays(date, days) {
  if (!validDate(date) || !Number.isFinite(Number(days))) return "";
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + Number(days));
  return d.toISOString().slice(0, 10);
}
export const diffDays = (a, b = today()) =>
  a && validDate(a)
    ? Math.round((Date.parse(a) - Date.parse(b)) / 86400000)
    : null;
export const dueDate = (r) =>
  r.kind === "week" ? r.durasi_habis : r.tanggal_reset;
export function status(r, date = today()) {
  const days = diffDays(dueDate(r), date),
    week = r.kind === "week";
  if (days === null)
    return { key: "unset", label: "Belum diatur", tone: "neutral", days };
  if (days < 0)
    return {
      key: "overdue",
      label: week ? "Sudah habis" : "Lewat reset",
      tone: "danger",
      days,
    };
  if (days === 0)
    return {
      key: "today",
      label: week ? "Habis hari ini" : "Reset hari ini",
      tone: "orange",
      days,
    };
  if (days <= (week ? 2 : 3))
    return {
      key: "soon",
      label: week ? "Segera habis" : "Segera reset",
      tone: "warning",
      days,
    };
  return { key: "active", label: "Aktif", tone: "success", days };
}
const date = z
  .string()
  .refine(
    (v) => !v || validDate(v),
    "Tanggal tidak valid (gunakan YYYY-MM-DD).",
  )
  .transform((v) => v || null)
  .nullable()
  .optional();
const text = z
  .string()
  .trim()
  .max(2000)
  .nullish()
  .transform((v) => v ?? "");
const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => v ?? "");
export const accountSchema = z
  .object({
    kind: z.enum(kinds),
    email: optionalText(255),
    password: z
      .string()
      .max(255)
      .nullish()
      .transform((v) => v ?? ""),
    tanggal_reset: date,
    tipe_sharing: optionalText(200),
    deskripsi: text,
    tanggal_terjual: date,
    durasi_habis: date,
    nomor: optionalText(100),
    profil: optionalText(100),
    device: optionalText(200),
    lokasi: optionalText(200),
    durasi: z.coerce.number().int().min(1).max(3650).nullable().optional(),
  })
  .superRefine((r, ctx) => {
    const issue = (path, message) =>
      ctx.addIssue({ code: "custom", path: [path], message });
    if (r.kind !== "disney") {
      if (!z.email().safeParse(r.email).success)
        issue("email", "Format email tidak valid.");
      if (!r.password) issue("password", "Password wajib diisi.");
      if (r.kind === "netflix" && !sharingTypes.includes(r.tipe_sharing))
        issue("tipe_sharing", "Tipe sharing tidak valid.");
    } else {
      for (const field of ["nomor", "profil", "device", "lokasi"])
        if (!r[field]) issue(field, `${field} wajib diisi.`);
      if (!r.durasi) issue("durasi", "Durasi hari wajib diisi.");
      if (!r.tanggal_terjual)
        issue("tanggal_terjual", "Tanggal terjual wajib diisi.");
      if (!r.tanggal_reset)
        issue("tanggal_reset", "Tanggal reset wajib diisi.");
    }
    if (
      r.kind === "week" &&
      r.tanggal_terjual &&
      r.durasi_habis &&
      r.durasi_habis < r.tanggal_terjual
    )
      issue(
        "durasi_habis",
        "Tanggal habis tidak boleh sebelum tanggal terjual.",
      );
    if (r.kind === "disney" && r.tanggal_reset < r.tanggal_terjual)
      issue(
        "tanggal_reset",
        "Tanggal reset tidak boleh sebelum tanggal terjual.",
      );
  });
export const fields = {
  netflix: ["email", "password", "tanggal_reset", "tipe_sharing", "deskripsi"],
  week: ["email", "password", "tanggal_terjual", "durasi_habis", "deskripsi"],
  disney: [
    "nomor",
    "profil",
    "device",
    "lokasi",
    "tanggal_terjual",
    "tanggal_reset",
    "durasi",
  ],
};
export function cleanRecord(input) {
  const r = accountSchema.parse(input);
  return Object.fromEntries(
    ["kind", ...fields[r.kind]].map((k) => [k, r[k] ?? null]),
  );
}
export function fingerprint(record) {
  const r = cleanRecord(record);
  return JSON.stringify(fields[r.kind].map((k) => r[k] ?? ""));
}
export function uniqueRows(existing, incoming) {
  const seen = new Set(existing.map((r) => r.kind + fingerprint(r)));
  let skipped = 0;
  const rows = [];
  for (const r of incoming) {
    const key = r.kind + fingerprint(r);
    if (seen.has(key)) {
      skipped++;
      continue;
    }
    seen.add(key);
    rows.push(r);
  }
  return { rows, skipped };
}
