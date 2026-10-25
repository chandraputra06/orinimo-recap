import "dotenv/config";
import { createServer } from "vite";
import app from "./app.js";
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "spa",
});
app.use(vite.middlewares);
const portArg = process.argv.indexOf("--port");
const port =
  Number(portArg >= 0 ? process.argv[portArg + 1] : process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () =>
  console.log(`Orinimo dev ready on port ${port}`),
);
