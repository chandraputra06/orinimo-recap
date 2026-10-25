import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { createApp } from "../server/app.js";
import { encrypt, decrypt } from "../server/crypto.js";
process.env.APP_ENCRYPTION_KEY = "a".repeat(64);
test("encrypts with randomized IV, roundtrips, rejects tampering", () => {
  const a = encrypt("confidential"),
    b = encrypt("confidential");
  assert.notEqual(a, b);
  assert.ok(!a.includes("confidential"));
  assert.equal(decrypt(a), "confidential");
  const parts = a.split(".");
  const bytes = Buffer.from(parts[3], "base64");
  bytes[0] ^= 1;
  parts[3] = bytes.toString("base64");
  assert.throws(() => decrypt(parts.join(".")));
});
test("API blocks missing bearer credentials and does not cache secrets", async () => {
  const r = await request(createApp()).get("/api/accounts");
  assert.equal(r.status, 401);
  assert.equal(r.headers["cache-control"], "no-store");
});
test("API rejects malformed writes before database access", async () => {
  const app = createApp({
    authenticate: (req, res, next) => {
      req.user = { id: "00000000-0000-4000-8000-000000000001" };
      req.db = {
        from: () => {
          throw new Error("should not hit DB");
        },
      };
      next();
    },
  });
  const a = await request(app)
    .post("/api/accounts")
    .send({ kind: "disney", profil: "A" });
  assert.equal(a.status, 422);
  const b = await request(app).post("/api/accounts/import").send({ rows: [] });
  assert.equal(b.status, 422);
  const c = await request(app).put("/api/accounts/invalid").send({});
  assert.equal(c.status, 422);
});
function mockDb() {
  let records = [];
  return {
    get rows() {
      return records;
    },
    from() {
      let op = "read",
        payload,
        filters = [],
        limit = [0, 999];
      const q = {
        select() {
          return q;
        },
        insert(v) {
          op = "insert";
          payload = v;
          return q;
        },
        upsert(v) {
          op = "upsert";
          payload = v;
          return q;
        },
        update(v) {
          op = "update";
          payload = v;
          return q;
        },
        delete() {
          op = "delete";
          return q;
        },
        eq(k, v) {
          filters.push([k, v]);
          return q;
        },
        order() {
          return q;
        },
        range(a, b) {
          limit = [a, b];
          return q;
        },
        single() {
          return Promise.resolve(run(true));
        },
        maybeSingle() {
          return Promise.resolve(run(true));
        },
        then(resolve, reject) {
          return Promise.resolve(run(false)).then(resolve, reject);
        },
      };
      function run(single) {
        let found = records.filter((r) =>
          filters.every(([k, v]) => r[k] === v),
        );
        let data;
        if (op === "insert") {
          data = [
            {
              ...payload,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
            },
          ];
          records.push(...data);
        } else if (op === "upsert") {
          data = payload
            .filter(
              (p) =>
                !records.some(
                  (r) =>
                    r.import_key === p.import_key &&
                    r.owner_id === p.owner_id &&
                    r.kind === p.kind,
                ),
            )
            .map((p) => ({
              ...p,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
            }));
          records.push(...data);
        } else if (op === "update") {
          data = found.map((r) => ({ ...r, ...payload }));
          records = records.map((r) => data.find((x) => x.id === r.id) || r);
        } else if (op === "delete") {
          data = found;
          records = records.filter((r) => !found.includes(r));
        } else data = found.slice(limit[0], limit[1] + 1);
        return { data: single ? data[0] || null : data, error: null };
      }
      return q;
    },
  };
}
test("Express CRUD and import encryption/ownership contract", async () => {
  const db = mockDb();
  let owner = "00000000-0000-4000-8000-000000000001";
  const app = createApp({
    authenticate: (req, res, next) => {
      req.user = { id: owner };
      req.db = db;
      next();
    },
  });
  const row = {
    kind: "netflix",
    email: "demo@example.com",
    password: "secret",
    tipe_sharing: "1P1U 1 Bulan",
    tanggal_reset: "2026-10-25",
  };
  const created = await request(app).post("/api/accounts").send(row);
  assert.equal(created.status, 201);
  assert.equal(created.body.password, "secret");
  assert.equal(db.rows[0].password, undefined);
  assert.ok(db.rows[0].password_ciphertext);
  const id = created.body.id;
  let r = await request(app)
    .post("/api/accounts/import")
    .send({ rows: [row, row, { ...row, email: "second@example.com" }] });
  assert.equal(r.body.imported, 1);
  assert.equal(r.body.skipped, 2);
  r = await request(app)
    .put("/api/accounts/" + id)
    .send({ ...row, tanggal_reset: "2026-11-25" });
  assert.equal(r.body.tanggal_reset, "2026-11-25");
  owner = "00000000-0000-4000-8000-000000000002";
  assert.equal((await request(app).get("/api/accounts")).body.length, 0);
  assert.equal((await request(app).delete("/api/accounts/" + id)).status, 404);
  owner = "00000000-0000-4000-8000-000000000001";
  assert.equal((await request(app).delete("/api/accounts/" + id)).status, 204);
  assert.equal(db.rows.length, 1);
});
