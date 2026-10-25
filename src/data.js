import { createClient } from "@supabase/supabase-js";
import { today, addDays, cleanRecord, uniqueRows } from "../shared/domain.js";
export const configured = !!(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);
export const demoAllowed =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO === "false";
export const supabase = configured
  ? createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    )
  : null;
let demoSequence = 0;
const demoId = () => `demo-${Date.now()}-${++demoSequence}`;
export function sampleData() {
  const d = today();
  return [
    ...Array.from({ length: 8 }, (_, i) => ({
      kind: "netflix",
      email: `contoh${i + 1}@example.com`,
      password: "DemoOnly!123",
      tanggal_reset: addDays(d, [-2, 0, 1, 2, 8, 12, 18, 26][i]),
      tipe_sharing: i % 2 ? "1P2U 1 Bulan" : "1P1U 1 Bulan",
      deskripsi: "Data contoh untuk mencoba aplikasi.",
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      kind: "week",
      email: `mingguan${i + 1}@example.com`,
      password: "DemoOnly!123",
      tanggal_terjual: addDays(d, -5 + i),
      durasi_habis: addDays(d, 2 + i),
      deskripsi: "Data contoh mingguan.",
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      kind: "disney",
      nomor: `D-${String(i + 1).padStart(3, "0")}`,
      profil: `Profil ${i + 1}`,
      device: ["Smart TV", "Android", "iPhone", "Laptop"][i],
      lokasi: ["Denpasar", "Badung", "Gianyar", "Tabanan"][i],
      tanggal_terjual: addDays(d, -30 + i * 4),
      tanggal_reset: addDays(d, i * 4),
      durasi: 30,
    })),
  ].map((r) => ({ ...r, id: demoId(), created_at: new Date().toISOString() }));
}
let demoRecords = [];
export function startDemo() {
  demoRecords = sampleData();
}
// Demo is intentionally in memory. Real credentials are never stored in localStorage.
export async function request(path, options = {}, demo = false) {
  if (demo) {
    if (path === "/accounts" && (!options.method || options.method === "GET"))
      return structuredClone(demoRecords);
    if (path === "/accounts/import") {
      const valid = options.body.rows.map(cleanRecord);
      const { rows, skipped } = uniqueRows(demoRecords, valid);
      demoRecords.push(
        ...rows.map((r) => ({
          ...r,
          id: demoId(),
          created_at: new Date().toISOString(),
        })),
      );
      return { imported: rows.length, skipped };
    }
    if (options.method === "DELETE") {
      demoRecords = demoRecords.filter((r) => r.id !== path.split("/").pop());
      return null;
    }
    const r = {
      ...cleanRecord(options.body),
      id: options.method === "PUT" ? path.split("/").pop() : demoId(),
      created_at: new Date().toISOString(),
    };
    if (options.method === "POST") demoRecords.unshift(r);
    else demoRecords = demoRecords.map((x) => (x.id === r.id ? r : x));
    return structuredClone(r);
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Sesi berakhir. Silakan masuk kembali.");
  const res = await fetch("/api" + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 204) return null;
  const result = await res.json();
  if (!res.ok) throw new Error(result.message || "Permintaan gagal.");
  return result;
}
