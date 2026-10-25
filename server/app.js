import express from "express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { cleanRecord, fingerprint } from "../shared/domain.js";
import { encrypt, decrypt, importDigest } from "./crypto.js";
const fail = (status, message) => Object.assign(new Error(message), { status });
const decode = (r) => {
  const { password_ciphertext, import_key, ...rest } = r;
  return { ...rest, password: decrypt(password_ciphertext) };
};
const encode = (r, owner) => {
  const { password, ...rest } = cleanRecord(r);
  return {
    ...rest,
    owner_id: owner,
    password_ciphertext: encrypt(password),
    import_key: importDigest(r.kind + fingerprint(r)),
  };
};
export function createApp({ authenticate } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "3mb" }));
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Content-Type-Options", "nosniff");
    next();
  });
  app.get("/api/health", (_req, res) =>
    res.json({
      ok: true,
      configured: !!(
        process.env.SUPABASE_URL &&
        process.env.SUPABASE_ANON_KEY &&
        /^[a-f\d]{64}$/i.test(process.env.APP_ENCRYPTION_KEY || "")
      ),
    }),
  );
  app.use(
    "/api",
    authenticate ||
      (async (req, res, next) => {
        try {
          const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
          if (!token) throw fail(401, "Silakan masuk terlebih dahulu.");
          if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY)
            throw fail(503, "Supabase belum dikonfigurasi.");
          const db = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
              global: { headers: { Authorization: `Bearer ${token}` } },
              auth: { persistSession: false, autoRefreshToken: false },
            },
          );
          const {
            data: { user },
            error,
          } = await db.auth.getUser(token);
          if (error || !user)
            throw fail(401, "Sesi berakhir. Silakan masuk kembali.");
          if (user.app_metadata?.role !== "admin")
            throw fail(403, "Akun ini belum memiliki akses admin.");
          req.db = db;
          req.user = user;
          next();
        } catch (e) {
          next(e);
        }
      }),
  );
  app.get("/api/accounts", async (req, res, next) => {
    try {
      let rows = [];
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await req.db
          .from("accounts")
          .select("*")
          .eq("owner_id", req.user.id)
          .order("created_at", { ascending: false })
          .order("id")
          .range(offset, offset + 999);
        if (error) throw error;
        rows.push(...data);
        if (data.length < 1000) break;
      }
      res.json(rows.map(decode));
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/accounts", async (req, res, next) => {
    try {
      const r = encode(req.body, req.user.id);
      const { data, error } = await req.db
        .from("accounts")
        .insert(r)
        .select()
        .single();
      if (error) throw error;
      res.status(201).json(decode(data));
    } catch (e) {
      next(e);
    }
  });
  app.post("/api/accounts/import", async (req, res, next) => {
    try {
      const input = z
        .array(z.record(z.string(), z.unknown()))
        .min(1)
        .max(2000)
        .parse(req.body.rows);
      const rows = input.map((r) => encode(r, req.user.id));
      const seen = new Set();
      const unique = rows.filter((r) => {
        if (seen.has(r.kind + r.import_key)) return false;
        seen.add(r.kind + r.import_key);
        return true;
      });
      const { data, error } = await req.db
        .from("accounts")
        .upsert(unique, {
          onConflict: "owner_id,kind,import_key",
          ignoreDuplicates: true,
        })
        .select("id");
      if (error) throw error;
      res.json({ imported: data.length, skipped: rows.length - data.length });
    } catch (e) {
      next(e);
    }
  });
  app.put("/api/accounts/:id", async (req, res, next) => {
    try {
      z.uuid().parse(req.params.id);
      const row = encode(req.body, req.user.id);
      const { data, error } = await req.db
        .from("accounts")
        .update(row)
        .eq("id", req.params.id)
        .eq("owner_id", req.user.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      if (!data) throw fail(404, "Data tidak ditemukan.");
      res.json(decode(data));
    } catch (e) {
      next(e);
    }
  });
  app.delete("/api/accounts/:id", async (req, res, next) => {
    try {
      z.uuid().parse(req.params.id);
      const { data, error } = await req.db
        .from("accounts")
        .delete()
        .eq("id", req.params.id)
        .eq("owner_id", req.user.id)
        .select("id");
      if (error) throw error;
      if (!data.length) throw fail(404, "Data tidak ditemukan.");
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  });
  app.use("/api", (_req, res) =>
    res.status(404).json({ message: "Endpoint tidak ditemukan." }),
  );
  app.use((err, _req, res, _next) => {
    const status =
      err instanceof z.ZodError
        ? 422
        : err.code === "23505"
          ? 409
          : err.status || 500;
    const message =
      err instanceof z.ZodError
        ? err.issues.map((x) => x.message).join(" ")
        : err.code === "23505"
          ? "Data identik sudah tersimpan."
          : status < 500
            ? err.message
            : "Permintaan gagal. Periksa koneksi dan konfigurasi server.";
    res.status(status).json({ message });
  });
  return app;
}
export default createApp();
