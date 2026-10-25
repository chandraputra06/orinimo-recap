import test from "node:test";
import assert from "node:assert/strict";
import {
  addDays,
  status,
  cleanRecord,
  uniqueRows,
  todayBreakdown,
} from "../shared/domain.js";
import { excelDate, parseWorkbook, writeWorkbook } from "../shared/excel.js";
import ExcelJS from "exceljs";
const n = {
  kind: "netflix",
  email: "demo@example.com",
  password: "secret",
  tanggal_reset: "2026-10-25",
  tipe_sharing: "1P1U 1 Bulan",
  deskripsi: "",
};
const d = {
  kind: "disney",
  nomor: "D-001",
  profil: "A",
  device: "TV",
  lokasi: "Denpasar",
  tanggal_terjual: "2026-10-01",
  tanggal_reset: "2026-10-31",
  durasi: 30,
};
test("calendar arithmetic covers month/year/leap boundaries", () => {
  assert.equal(addDays("2026-12-29", 7), "2027-01-05");
  assert.equal(addDays("2028-02-28", 2), "2028-03-01");
  assert.equal(addDays("2026-02-30", 2), "");
});
test("Netflix reminders cover overdue/today/H-3/H-4 and unset", () => {
  assert.equal(status(n, "2026-10-26").key, "overdue");
  assert.equal(status(n, "2026-10-25").key, "today");
  assert.equal(status(n, "2026-10-22").key, "soon");
  assert.equal(status(n, "2026-10-21").key, "active");
  assert.equal(status({ ...n, tanggal_reset: null }).key, "unset");
});
test("week H-2 and Disney H-3 are separate thresholds", () => {
  const r = { kind: "week", durasi_habis: "2026-10-25" };
  assert.equal(status(r, "2026-10-22").key, "active");
  assert.equal(status(r, "2026-10-23").key, "soon");
  assert.equal(status(d, "2026-10-28").key, "soon");
  assert.equal(status(d, "2026-10-27").key, "active");
});
test("today reminder breakdown groups Netflix by sharing type and services", () => {
  const rows = [
    n,
    { ...n, email: "second@example.com" },
    { ...n, email: "third@example.com" },
    {
      kind: "week",
      email: "weekly@example.com",
      password: "secret",
      tanggal_terjual: "2026-10-18",
      durasi_habis: "2026-10-25",
      deskripsi: "",
    },
    { ...d, tanggal_reset: "2026-10-25" },
    { ...d, nomor: "D-002", tanggal_reset: "2026-10-25" },
    { ...n, email: "later@example.com", tanggal_reset: "2026-10-26" },
  ];

  assert.deepEqual(todayBreakdown(rows, "2026-10-25"), [
    { kind: "disney", sharing: "", count: 2 },
    { kind: "netflix", sharing: "1P1U 1 Bulan", count: 3 },
    { kind: "week", sharing: "", count: 1 },
  ]);
});
test("reject invalid dates, missing Disney fields, reversed dates and unsupported sharing", () => {
  assert.throws(() => cleanRecord({ ...n, tanggal_reset: "2026-02-30" }));
  assert.throws(() => cleanRecord({ ...d, device: "" }));
  assert.throws(() => cleanRecord({ ...d, tanggal_reset: "2026-09-30" }));
  assert.throws(() => cleanRecord({ ...n, tipe_sharing: "invalid" }));
  assert.throws(() => cleanRecord({ ...d, durasi: 0 }));
});
test("normalizes blank spreadsheet text cells before validating records", () => {
  assert.throws(
    () =>
      cleanRecord({
        ...n,
        email: null,
        password: null,
        tipe_sharing: null,
        deskripsi: null,
      }),
    (error) => {
      assert.ok(
        error.issues.every(
          (issue) =>
            issue.code !== "invalid_type" ||
            !["email", "password", "tipe_sharing", "deskripsi"].includes(
              issue.path[0],
            ),
        ),
      );
      assert.ok(error.issues.some((issue) => issue.path[0] === "email"));
      assert.ok(error.issues.some((issue) => issue.path[0] === "password"));
      assert.ok(error.issues.some((issue) => issue.path[0] === "tipe_sharing"));
      return true;
    },
  );
});
test("strip client identity, owner and non-service fields", () => {
  const r = cleanRecord({
    ...d,
    owner_id: "other",
    id: "other",
    password: "should-not-store",
    email: "wrong@example.com",
  });
  assert.equal(r.owner_id, undefined);
  assert.equal(r.password, undefined);
  assert.equal(r.email, undefined);
});
test("duplicate import uses whole record, allows same email with different expiration", () => {
  const r = uniqueRows(
    [n],
    [
      n,
      { ...n, tanggal_reset: "2026-11-25" },
      { ...n, tanggal_reset: "2026-11-25" },
    ],
  );
  assert.equal(r.skipped, 2);
  assert.equal(r.rows.length, 1);
});
test("Excel normalizes serialized, ISO, localized dates without silent loss", () => {
  assert.equal(excelDate(46000), "2025-12-09");
  assert.equal(excelDate("25/10/2026"), "2026-10-25");
  assert.equal(excelDate("2026-10-25 00:00:00"), "2026-10-25");
  assert.throws(() => excelDate("bad"));
  assert.throws(() => excelDate({ formula: "TODAY()", result: 46000 }));
});
test("Excel roundtrip preserves passwords as strings and all service columns", async () => {
  for (const r of [
    n,
    {
      kind: "week",
      email: "week@example.com",
      password: "=not-a-formula",
      tanggal_terjual: "2026-10-25",
      durasi_habis: "2026-11-01",
      deskripsi: "",
    },
    d,
  ]) {
    const out = await parseWorkbook(await writeWorkbook([r], r.kind), r.kind);
    assert.equal(out.errors.length, 0);
    assert.deepEqual(out.rows, [cleanRecord(r)]);
  }
});
test("Excel import accepts blank optional description cells", async () => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Rekapan");
  sheet.addRow([
    "email",
    "password",
    "tanggal_reset",
    "tipe_sharing",
    "deskripsi",
  ]);
  sheet.addRow([n.email, n.password, n.tanggal_reset, n.tipe_sharing, null]);

  const result = await parseWorkbook(
    await workbook.xlsx.writeBuffer(),
    "netflix",
  );

  assert.deepEqual(result.errors, []);
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].deskripsi, "");
});
test("Excel rejects mismatched template; reports invalid row before any write", async () => {
  const wrongTemplate = await writeWorkbook([], "disney");
  await assert.rejects(() => parseWorkbook(wrongTemplate, "netflix"));
  const w = new ExcelJS.Workbook(),
    s = w.addWorksheet("Data");
  s.addRow(["email", "password", "tanggal_reset", "tipe_sharing", "deskripsi"]);
  s.addRow(["bad email", "secret", "2026-10-25", "1P1U 1 Bulan", ""]);
  const p = await parseWorkbook(await w.xlsx.writeBuffer(), "netflix");
  assert.equal(p.errors[0].row, 2);
  assert.equal(p.rows.length, 0);
});
