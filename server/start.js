import "dotenv/config";
import express from "express";
import app from "./app.js";
import path from "node:path";
app.use(express.static("dist"));
app.get("/{*splat}", (_req, res) =>
  res.sendFile(path.resolve("dist/index.html")),
);
app.listen(Number(process.env.PORT) || 3000);
