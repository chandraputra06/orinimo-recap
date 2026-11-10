
import { z } from "zod";

export const kinds = ["netflix", "week", "disney", "canva"];

export const names = {
  netflix: "Netflix",
  week: "Netflix 1 Week",
  disney: "Disney+",
  canva: "Canva",
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

export function validDate(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) &&
    new Date(value + "T00:00:00Z")
      .toISOString()
      .slice(0, 10) === value
  );
}

export function addDays(date, days) {
  if (!validDate(date) || !Number.isFinite(Number(days))) {
    return "";
  }

  const result = new Date(date + "T00:00:00Z");
  result.setUTCDate(result.getUTCDate() + Number(days));
  return result.toISOString().slice(0, 10);
}

export const diffDays = (date, current = today()) =>
  date && validDate(date)
    ? Math.round(
        (Date.parse(date) - Date.parse(current)) / 86400000
      )
    : null;

export const dueDate = (record) =>
  record.kind === "week"
    ? record.durasi_habis
    : record.kind === "canva"
      ? record.tanggal_berakhir
      : record.tanggal_reset;

export function status(record, current = today()) {
  const days = diffDays(dueDate(record), current);
  const week = record.kind === "week";
  const expires = week || record.kind === "canva";

  if (days === null) {
    return {
      key: "unset",
      label: "Belum diatur",
      tone: "neutral",
      days,
    };
  }

  if (days < 0) {
    return {
      key: "overdue",
      label: expires ? "Sudah habis" : "Lewat reset",
      tone: "danger",
      days,
    };
  }

  if (days === 0) {
    return {
      key: "today",
      label: expires ? "Habis hari ini" : "Reset hari ini",
      tone: "orange",
      days,
    };
  }

  if (days <= (week ? 2 : 3)) {
    return {
      key: "soon",
      label: expires ? "Segera habis" : "Segera reset",
      tone: "warning",
      days,
    };
  }

  return {
    key: "active",
    label: "Aktif",
    tone: "success",
    days,
  };
}

export function todayBreakdown(records, current = today()) {
  const groups = new Map();

  for (const record of records) {
    if (status(record, current).key !== "today") continue;

    const sharing =
      record.kind === "netflix"
        ? record.tipe_sharing || "Tipe belum diatur"
        : "";

    const key =
      record.kind === "netflix"
        ? `${record.kind}:${sharing}`
        : record.kind;

    const group = groups.get(key) || {
      kind: record.kind,
      sharing,
      count: 0,
    };

    group.count++;
    groups.set(key, group);
  }

  const order = {
    disney: 0,
    netflix: 1,
    week: 2,
    canva: 3,
  };

  return [...groups.values()].sort(
    (a, b) =>
      order[a.kind] - order[b.kind] ||
      a.sharing.localeCompare(b.sharing, "id")
  );
}

const date = z
  .string()
  .refine(
    (value) => !value || validDate(value),
    "Tanggal tidak valid (gunakan YYYY-MM-DD)."
  )
  .transform((value) => value || null)
  .nullable()
  .optional();

const text = z
  .string()
  .trim()
  .max(2000)
  .nullish()
  .transform((value) => value ?? "");

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((value) => value ?? "");

export const accountSchema = z
  .object({
    kind: z.enum(kinds),
    email: optionalText(255),
    password: z
      .string()
      .max(255)
      .nullish()
      .transform((value) => value ?? ""),
    tanggal_reset: date,
    tipe_sharing: optionalText(200),
    deskripsi: text,
    tanggal_terjual: date,
    tanggal_dibeli: date,
    tanggal_berakhir: date,
    durasi_habis: date,
    nomor: optionalText(100),
    profil: optionalText(100),
    device: optionalText(200),
    lokasi: optionalText(200),
    durasi: z.coerce
      .number()
      .int()
      .min(1)
      .max(3650)
      .nullable()
      .optional(),
    designer: z.boolean().default(false),
  })
  .superRefine((record, ctx) => {
    const issue = (field, message) =>
      ctx.addIssue({
        code: "custom",
        path: [field],
        message,
      });

    if (record.kind === "canva") {
      if (!z.email().safeParse(record.email).success) {
        issue("email", "Format email Canva tidak valid.");
      }

      if (!record.tanggal_dibeli) {
        issue("tanggal_dibeli", "Tanggal dibeli wajib diisi.");
      }

      if (!record.tanggal_berakhir) {
        issue("tanggal_berakhir", "Tanggal berakhir wajib diisi.");
      }

      if (!record.durasi) {
        issue("durasi", "Durasi wajib diisi.");
      }

      if (
        record.tanggal_dibeli &&
        record.tanggal_berakhir &&
        record.tanggal_berakhir < record.tanggal_dibeli
      ) {
        issue(
          "tanggal_berakhir",
          "Tanggal berakhir tidak boleh sebelum tanggal dibeli."
        );
      }
    } else if (record.kind !== "disney") {
      if (!z.email().safeParse(record.email).success) {
        issue("email", "Format email tidak valid.");
      }

      if (!record.password) {
        issue("password", "Password wajib diisi.");
      }

      if (
        record.kind === "netflix" &&
        !sharingTypes.includes(record.tipe_sharing)
      ) {
        issue("tipe_sharing", "Tipe sharing tidak valid.");
      }
    } else {
      for (const field of [
        "nomor",
        "profil",
        "device",
        "lokasi",
      ]) {
        if (!record[field]) {
          issue(field, `${field} wajib diisi.`);
        }
      }

      if (!record.durasi) {
        issue("durasi", "Durasi wajib diisi.");
      }

      if (!record.tanggal_terjual) {
        issue("tanggal_terjual", "Tanggal terjual wajib diisi.");
      }

      if (!record.tanggal_reset) {
        issue("tanggal_reset", "Tanggal reset wajib diisi.");
      }
    }

    if (
      record.kind === "week" &&
      record.tanggal_terjual &&
      record.durasi_habis &&
      record.durasi_habis < record.tanggal_terjual
    ) {
      issue(
        "durasi_habis",
        "Tanggal habis tidak boleh sebelum tanggal terjual."
      );
    }

    if (
      record.kind === "disney" &&
      record.tanggal_reset &&
      record.tanggal_terjual &&
      record.tanggal_reset < record.tanggal_terjual
    ) {
      issue(
        "tanggal_reset",
        "Tanggal reset tidak boleh sebelum tanggal terjual."
      );
    }
  });

export const fields = {
  netflix: [
    "email",
    "password",
    "tanggal_reset",
    "tipe_sharing",
    "deskripsi",
  ],
  week: [
    "email",
    "password",
    "tanggal_terjual",
    "durasi_habis",
    "deskripsi",
  ],
  canva: [
    "email",
    "tanggal_dibeli",
    "tanggal_berakhir",
    "durasi",
    "designer",
  ],
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
  const record = accountSchema.parse(input);

  return Object.fromEntries(
    ["kind", ...fields[record.kind]].map((key) => [
      key,
      record[key] ?? null,
    ])
  );
}

export function fingerprint(record) {
  const clean = cleanRecord(record);

  return JSON.stringify(
    fields[clean.kind].map((key) => clean[key] ?? "")
  );
}

export function uniqueRows(existing, incoming) {
  const seen = new Set(
    existing.map((record) => record.kind + fingerprint(record))
  );

  let skipped = 0;
  const rows = [];

  for (const record of incoming) {
    const key = record.kind + fingerprint(record);

    if (seen.has(key)) {
      skipped++;
      continue;
    }

    seen.add(key);
    rows.push(record);
  }

  return { rows, skipped };
}
