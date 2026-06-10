const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const APP_BUILD = "2026-05-04";

const ADMIN_KEY = process.env.ADMIN_KEY || "devadmin123";
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "sifre123";

// Render'da persistent depolama için /data, local'de public/uploads kullan
const DATA_DIR = fs.existsSync("/data") ? "/data" : path.join(__dirname, "public");
const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use(express.json());

app.get("/yonetim", (req, res) => {
  res.redirect("/");
});

app.get("/admin.html", (req, res) => {
  res.redirect("/");
});

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    build: APP_BUILD,
    gallery: true,
    auth: {
      method: process.env.ADMIN_USER && process.env.ADMIN_PASS ? "user-pass" : "key",
      adminUser: ADMIN_USER,
    },
  });
});

function requireAdminAuth(req, res, next) {
  const user = req.header("x-admin-user") || "";
  const pass = req.header("x-admin-pass") || "";
  const key = req.header("x-admin-key") || "";

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return next();
  }

  if (key && key === ADMIN_KEY) {
    return next();
  }

  return res.status(401).json({ error: "Yetkisiz" });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const safe = String(file.originalname || "foto")
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 80);
    cb(null, Date.now() + "-" + safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const mime = String(file.mimetype || "").toLowerCase();
    const ext = path.extname(file.originalname || "").toLowerCase();
    const extOk = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".jfif", ".bmp", ".heic", ".heif"].includes(ext);

    if (mime.startsWith("image/")) {
      return cb(null, true);
    }

    if ((mime === "application/octet-stream" || mime === "binary/octet-stream") && extOk) {
      return cb(null, true);
    }

    return cb(new Error("Desteklenmeyen dosya turu (jpg, png, webp, gif, bmp, heic)"));
  },
});

app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.static(path.join(__dirname, "public")));

const DB_PATH = path.join(DATA_DIR, "data.db");
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price_per_m2 REAL NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      filename TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (err) {
      console.error("Veritabani kontrol hatasi:", err.message);
      return;
    }

    if (row.count === 0) {
      const stmt = db.prepare(
        "INSERT INTO products (name, description, price_per_m2) VALUES (?, ?, ?)"
      );
      stmt.run("Katlanir Cam Balkon", "Mekanlara modern ve ferah gorunum", 2500);
      stmt.run("Surme Cam Balkon", "Kolay kullanimli surme sistem", 2200);
      stmt.run("Isi Camli Balkon", "Isı yalitimi guclu cam balkon cozumleri", 3000);
      stmt.finalize();
    }
  });
});

app.get("/api/gallery", (req, res) => {
  db.all("SELECT * FROM gallery ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Galeri alinamadi" });
    }
    const list = rows.map((row) => ({
      id: row.id,
      title: row.title,
      url: "/uploads/" + row.filename,
    }));
    res.json(list);
  });
});

app.post("/api/gallery", requireAdminKey, (req, res) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "Dosya cok buyuk (en fazla 5 MB)" });
        }
        return res.status(400).json({ error: err.message || "Yukleme basarisiz" });
      }
      return res.status(400).json({ error: err.message || "Yukleme basarisiz" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "Dosya seciniz" });
    }

    const title = (req.body.title || "").trim();
    db.run(
      "INSERT INTO gallery (title, filename) VALUES (?, ?)",
      [title, req.file.filename],
      function onGalleryInsert(insertErr) {
        if (insertErr) {
          const diskPath = path.join(UPLOAD_DIR, req.file.filename);
          fs.unlink(diskPath, () => {});
          return res.status(500).json({ error: "Kayit olusturulamadi" });
        }
        res.status(201).json({
          success: true,
          id: this.lastID,
          url: "/uploads/" + req.file.filename,
        });
      }
    );
  });
});

app.delete("/api/gallery/:id", requireAdminKey, (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Gecersiz kayit" });

  db.get("SELECT * FROM gallery WHERE id = ?", [id], (err, row) => {
    if (err || !row) return res.status(err ? 500 : 404).json({ error: "Kayit bulunamadi" });
    const safePath = path.resolve(path.join(UPLOAD_DIR, row.filename));
    if (!safePath.startsWith(path.resolve(UPLOAD_DIR))) return res.status(400).json({ error: "Gecersiz dosya" });
    
    fs.unlink(safePath, (fileErr) => {
      db.run("DELETE FROM gallery WHERE id = ?", [id], function(delErr) {
        if (delErr) return res.status(500).json({ error: "Silinemedi" });
        res.json({ success: true });
      });
    });
  });
});

app.get("/api/products", (req, res) => {
  db.all("SELECT * FROM products ORDER BY id ASC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Urunler alinamadi" });
    }
    res.json(rows);
  });
});

app.get("/api/appointments", requireAdminAuth, (req, res) => {
  db.all("SELECT * FROM appointments ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Randevular alinamadi" });
    }
    res.json(rows);
  });
});

app.post("/api/appointments", (req, res) => {
  const firstName = String(req.body.first_name || "").trim();
  const lastName = String(req.body.last_name || "").trim();
  const phone = String(req.body.phone || "").trim();
  const address = String(req.body.address || "").trim();

  if (!firstName || !lastName || !phone || !address) {
    return res.status(400).json({ error: "Lutfen isim, telefon ve adres bilgilerini eksiksiz giriniz" });
  }

  db.run(
    "INSERT INTO appointments (first_name, last_name, phone, address) VALUES (?, ?, ?, ?)",
    [firstName, lastName, phone, address],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ error: "Randevu kaydedilemedi" });
      }
      res.status(201).json({ success: true, id: this.lastID });
    }
  );
});

app.delete("/api/appointments/:id", requireAdminAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!id) {
    return res.status(400).json({ error: "Gecersiz randevu" });
  }

  db.run("DELETE FROM appointments WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Randevu silinemedi" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Randevu bulunamadi" });
    }
    res.json({ success: true });
  });
});

app.get("/api/admin/check", requireAdminAuth, (req, res) => {
  res.json({ ok: true, user: ADMIN_USER });
});

app.post("/api/products", requireAdminAuth, (req, res) => {
  const name = (req.body.name || "").trim();
  const description = (req.body.description || "").trim();
  const price = Number(req.body.price_per_m2);

  if (!name || Number.isNaN(price) || price <= 0) {
    return res.status(400).json({ error: "Urun adi ve gecerli m2 fiyati giriniz" });
  }

  db.run(
    "INSERT INTO products (name, description, price_per_m2) VALUES (?, ?, ?)",
    [name, description, price],
    function onInsert(err) {
      if (err) {
        return res.status(500).json({ error: "Urun eklenemedi" });
      }
      res.status(201).json({ success: true, id: this.lastID });
    }
  );
});

app.put("/api/products/:id", requireAdminKey, (req, res) => {
  const id = Number(req.params.id);
  const name = (req.body.name || "").trim();
  const description = (req.body.description || "").trim();
  const price = Number(req.body.price_per_m2);

  if (!id || !name || Number.isNaN(price) || price <= 0) {
    return res.status(400).json({ error: "Urun bilgilerini gecerli giriniz" });
  }

  db.run(
    "UPDATE products SET name = ?, description = ?, price_per_m2 = ? WHERE id = ?",
    [name, description, price, id],
    function onUpdateProduct(err) {
      if (err) {
        return res.status(500).json({ error: "Urun guncellenemedi" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Urun bulunamadi" });
      }
      res.json({ success: true });
    }
  );
});

app.put("/api/products/:id/price", requireAdminKey, (req, res) => {
  const id = Number(req.params.id);
  const price = Number(req.body.price_per_m2);

  if (!id || Number.isNaN(price) || price <= 0) {
    return res.status(400).json({ error: "Gecerli urun ve fiyat giriniz" });
  }

  db.run(
    "UPDATE products SET price_per_m2 = ? WHERE id = ?",
    [price, id],
    function onUpdate(err) {
      if (err) {
        return res.status(500).json({ error: "Fiyat guncellenemedi" });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Urun bulunamadi" });
      }
      res.json({ success: true });
    }
  );
});

app.delete("/api/products/:id", requireAdminKey, (req, res) => {
  const id = Number(req.params.id);

  if (!id) {
    return res.status(400).json({ error: "Gecerli urun seciniz" });
  }

  db.run("DELETE FROM products WHERE id = ?", [id], function onDelete(err) {
    if (err) {
      return res.status(500).json({ error: "Urun silinemedi" });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Urun bulunamadi" });
    }
    res.json({ success: true });
  });
});

app.get("/api/estimate", (req, res) => {
  const productId = Number(req.query.productId);
  const width = Number(req.query.width);
  const height = Number(req.query.height);

  if (!productId || Number.isNaN(width) || Number.isNaN(height) || width <= 0 || height <= 0) {
    return res.status(400).json({ error: "Gecerli olculer giriniz" });
  }

  db.get("SELECT * FROM products WHERE id = ?", [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: "Hesaplama yapilamadi" });
    }
    if (!product) {
      return res.status(404).json({ error: "Urun bulunamadi" });
    }

    const area = width * height;
    const estimatedPrice = area * product.price_per_m2;

    res.json({
      product: product.name,
      width,
      height,
      area,
      price_per_m2: product.price_per_m2,
      estimatedPrice,
    });
  });
});

app.listen(PORT, () => {
  console.log(`Sunucu calisiyor: http://localhost:${PORT}`);
  console.log(`Yonetim paneli: http://localhost:${PORT}/yonetim`);
  if (!process.env.ADMIN_KEY) {
    console.log("UYARI: ADMIN_KEY ayarli degil, varsayilan anahtar kullaniliyor: devadmin123");
  }
});
