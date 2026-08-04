import express from "express";
import cors from "cors";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Setup __dirname untuk ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Membaca file lppd.json dari folder api
let lppdData = {};
try {
  const filePath = path.join(__dirname, "lppd.json");
  lppdData = JSON.parse(readFileSync(filePath, "utf8"));
} catch (error) {
  console.error("Gagal membaca lppd.json:", error);
}

// Endpoint Utama: Langsung menampilkan 50 Data IKK
app.get("/", (req, res) => {
  const dataIkk = lppdData.ikk || [];
  
  res.json({
    status: "success",
    message: "API LPPD Kabupaten Pamekasan 2024",
    total: dataIkk.length,
    data: dataIkk
  });
});

// Endpoint Data Makro
app.get("/lppd/makro", (req, res) => {
  res.json({
    status: "success",
    meta: { kabupaten: "Pamekasan", tahun_anggaran: 2024 },
    data: lppdData.makro || []
  });
});

// Endpoint Data Anggaran
app.get("/lppd/anggaran", (req, res) => {
  res.json({
    status: "success",
    data: lppdData.anggaran || {}
  });
});

// Endpoint Data IKK (Mendukung query parameter ?urusan=Pendidikan)
app.get("/lppd/ikk", (req, res) => {
  const { urusan } = req.query;
  let dataIkk = lppdData.ikk || [];

  if (urusan) {
    dataIkk = dataIkk.filter(
      (item) => item.urusan.toLowerCase() === urusan.toLowerCase()
    );
  }

  res.json({
    status: "success",
    total: dataIkk.length,
    data: dataIkk
  });
});

// Endpoint Detail IKK berdasarkan ID
app.get("/lppd/ikk/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const dataIkk = lppdData.ikk || [];
  const detailIkk = dataIkk.find((item) => item.id === id);

  if (!detailIkk) {
    return res.status(404).json({
      status: "error",
      message: "Data Indikator Kinerja Kunci tidak ditemukan"
    });
  }

  res.json({
    status: "success",
    data: detailIkk
  });
});

// Handling Route 404
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Endpoint tidak ditemukan"
  });
});

export default app;