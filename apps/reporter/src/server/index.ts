import express from "express";
import cors from "cors";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";
import { router } from "./router.js";

const app = express();
const PORT = process.env["PORT"] ?? "3001";

app.use(cors());
app.use(express.json());
app.use("/api", router);

if (process.env["NODE_ENV"] === "production") {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const clientDist = join(__dirname, "../../dist/client");
  app.use(express.static(clientDist));
  app.use((_req, res) => {
    res.sendFile(join(clientDist, "index.html"));
  });
}

app.listen(Number(PORT), () => {
  console.log(`Reporter server running on http://localhost:${PORT}`);
});
