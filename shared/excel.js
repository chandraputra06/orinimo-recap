import ExcelJS from "exceljs";
import { fields, cleanRecord, validDate } from "./domain.js";
function scalar(v) {
  if (v && typeof v === "object" && !(v instanceof Date)) {
    if ("formula" in v)
      throw new Error(
        "Sel formula tidak diterima; ekspor sebagai nilai dahulu.",
      );
    if (v.richText) return v.richText.map((x) => x.text).join("");
    if (v.text) return v.text;
  }
  return v;
}
export function excelDate(value) {
  const v = scalar(value);
  if (v === null || v === undefined || v === "") return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  if (typeof v === "number")
    return new Date(Date.UTC(1899, 11, 30) + Math.floor(v) * 86400000)
      .toISOString()
      .slice(0, 10);
  let s = String(v).trim().split(/[T ]/)[0];
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split("/");
    s = `${y}-${m}-${d}`;
  }
  if (!validDate(s))
    throw new Error(
      "Tanggal tidak valid. Gunakan YYYY-MM-DD atau sel tanggal Excel.",
    );
  return s;
}
export async function parseWorkbook(bytes, kind) {
  const w = new ExcelJS.Workbook();
  await w.xlsx.load(bytes);
  const s = w.worksheets[0];
  if (!s) throw new Error("File tidak memiliki worksheet.");
  if (s.rowCount > 2001) throw new Error("Maksimal 2.000 baris per impor.");
  const headers = [];
  s.getRow(1).eachCell(
    (c, i) =>
      (headers[i] = String(scalar(c.value) || "")
        .trim()
        .toLowerCase()),
  );
  const missing = fields[kind].filter((f) => !headers.includes(f));
  if (missing.length)
    throw new Error("Kolom belum lengkap: " + missing.join(", "));
  const rows = [],
    errors = [];
  for (let i = 2; i <= s.rowCount; i++) {
    const row = s.getRow(i);
    if (!row.actualCellCount) continue;
    try {
      const r = { kind };
      for (const f of fields[kind]) {
        const v = scalar(row.getCell(headers.indexOf(f)).value);
        r[f] =
          f.startsWith("tanggal_") || f === "durasi_habis"
            ? excelDate(v)
            : f === "durasi"
              ? Number(v)
              : String(v ?? "").trim();
      }
      rows.push(cleanRecord(r));
    } catch (e) {
      errors.push({
        row: i,
        message: e.issues?.map((x) => x.message).join(" ") || e.message,
      });
    }
  }
  return { rows, errors, total: rows.length + errors.length };
}
export async function writeWorkbook(records, kind, template = false) {
  const w = new ExcelJS.Workbook();
  w.creator = "Orinimo";
  const s = w.addWorksheet("Rekapan");
  s.columns = fields[kind].map((k) => ({
    header: k,
    key: k,
    width: k === "deskripsi" ? 44 : k === "email" ? 36 : 23,
  }));
  if (!template)
    for (const r of records)
      s.addRow(Object.fromEntries(fields[kind].map((k) => [k, r[k] ?? ""])));
  s.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  s.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF7B1E1E" },
  };
  s.getRow(1).height = 28;
  s.views = [{ state: "frozen", ySplit: 1 }];
  s.autoFilter = {
    from: "A1",
    to: { row: Math.max(1, s.rowCount), column: fields[kind].length },
  };
  return w.xlsx.writeBuffer();
}
