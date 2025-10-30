import express, { Request, Response } from "express";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import livereload from "livereload";
import connectLivereload from "connect-livereload";
import cookieParser from "cookie-parser";
import db from "./utils/db.js";
import { TSHIRT_COLLECTION } from "./utils/tshirt.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

const liveReloadServer = livereload.createServer({
  exts: ["html", "js", "css", "tsx", "ts"],
  debug: false,
});

liveReloadServer.watch([
  join(__dirname, "../public"),
  join(__dirname, "../dist"),
  join(__dirname, "../src"),
]);

app.use(connectLivereload());
app.use(cookieParser());
app.use(express.json());
app.use(express.static(join(__dirname, "../public")));
app.use("/dist", express.static(join(__dirname, "../dist")));

// Cart endpoints ---

app.get("/api/cart", async (req: Request, res: Response<{ids: string[]}>) => {
  try {
    const userId = (req as any).cookies?.user_id;
    if (!userId) return res.json({ ids: [] });

    // Get product IDs from cart
    const rows = await new Promise<any>((resolve, reject) => {
      try {
        const r = db`SELECT product_id FROM carts WHERE user_id = ${userId}`;
        Promise.resolve(r).then(resolve).catch(reject);
      } catch (e) {
        reject(e);
      }
    });

    // Return array of product IDs or empty array if none found
    return res.json({
      ids: rows && Array.isArray(rows) ? rows.map(r => r.product_id) : [],
    });
  } catch (err) {
    console.error("Error in /api/cart GET:", err);
    return res.status(500).json({ ids: [] });
  }
});

app.post("/api/cart", async (req: Request, res: Response<{ok: true} | {error: string}>) => {
  try {
    const userId = (req as any).cookies?.user_id;
    if (!userId) return res.status(401).json({ error: "Login required" });

    const productId = (req as any).body?.productId?.toString();
    if (!productId) return res.status(400).json({ error: "Product ID required" });

    // Insert cart item (if doesn't exist)
    await new Promise<any>((resolve, reject) => {
      try {
        const r = db`
          INSERT INTO carts (user_id, product_id)
          VALUES (${userId}, ${productId})
          ON CONFLICT (user_id, product_id) DO NOTHING
        `;
        Promise.resolve(r).then(resolve).catch(reject);
      } catch (e) {
        reject(e);
      }
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error in /api/cart POST:", err);
    return res.status(500).json({ error: "Failed to add to cart" });
  }
});

app.delete("/api/cart", async (req: Request, res: Response<{ok: true} | {error: string}>) => {
  try {
    const userId = (req as any).cookies?.user_id;
    if (!userId) return res.status(401).json({ error: "Login required" });

    const productId = (req as any).body?.productId?.toString();
    if (!productId) return res.status(400).json({ error: "Product ID required" });

    // Delete cart item
    await new Promise<any>((resolve, reject) => {
      try {
        const r = db`
          DELETE FROM carts 
          WHERE user_id = ${userId} AND product_id = ${productId}
        `;
        Promise.resolve(r).then(resolve).catch(reject);
      } catch (e) {
        reject(e);
      }
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Error in /api/cart DELETE:", err);
    return res.status(500).json({ error: "Failed to remove from cart" });
  }
});

// Auth endpoints ---

app.get("/api/auth/user", async (req: Request, res: Response<{user: string | null}>) => {
  try {
    const userId = (req as any).cookies?.user_id;
    if (!userId) return res.json({ user: null });

    const rows = await new Promise<any>((resolve, reject) => {
      try {
        const r = db`SELECT name FROM users WHERE id = ${userId}`;
        Promise.resolve(r).then(resolve).catch(reject);
      } catch (e) {
        reject(e);
      }
    });

    if (rows && Array.isArray(rows) && rows.length > 0) {
      return res.json({ user: rows[0].name });
    }
    return res.json({ user: null });
  } catch (err) {
    console.error("Error in /api/auth/user:", err);
    return res.status(500).json({ user: null });
  }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
  try {
    const name = (req as any).body?.name?.toString().trim();
    if (!name) return res.status(400).json({ error: "Name required" });

    // Check for existing user
    const existing = await new Promise<any>((resolve, reject) => {
      try {
        const r = db`SELECT id FROM users WHERE name = ${name}`;
        Promise.resolve(r).then(resolve).catch(reject);
      } catch (e) {
        reject(e);
      }
    });

    let userId: string | null = null;
    if (existing && Array.isArray(existing) && existing.length > 0) {
      userId = existing[0].id;
    } else {
      const inserted = await new Promise<any>((resolve, reject) => {
        try {
          const r = db`INSERT INTO users (name) VALUES (${name}) RETURNING id`;
          Promise.resolve(r).then(resolve).catch(reject);
        } catch (e) {
          reject(e);
        }
      });
      if (inserted && Array.isArray(inserted) && inserted[0]) {
        userId = inserted[0].id;
      }
    }

    if (!userId) return res.status(500).json({ error: "Failed to create or find user" });

    const cookieOptions: any = {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

    res.cookie("user_id", userId, cookieOptions);
    return res.json({ id: userId });
  } catch (err) {
    console.error("Error in /api/auth/login:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/auth/logout", (req: Request, res: Response) => {
  try {
    res.clearCookie("user_id", { path: "/" });
    return res.json({ ok: true });
  } catch (err) {
    console.error("Error in /api/auth/logout:", err);
    return res.status(500).json({ error: "Logout failed" });
  }
});

// Product endpoints ---

app.get("/api/products", async (req: Request, res: Response) => {
  // For dev mode, return the in-file augmented collection if DB not configured.
  const supabaseUri = process.env.SUPABASE_URI;
  if (!supabaseUri) {
    return res.json(TSHIRT_COLLECTION.map(t => ({
      ...t,
      size: "M",
      price: 25,
    })));
  }

  // Otherwise try to fetch from DB; fall back to in-memory list on error.
  try {
    // Normalize to a Promise to avoid typing issues with the postgres client thenable
    const rows = await new Promise<any>((resolve, reject) => {
      try {
        const result = db`SELECT id, title, color, size, price FROM products`;
        Promise.resolve(result).then(resolve).catch(reject);
      } catch (e) {
        reject(e);
      }
    });
    if (!rows || (Array.isArray(rows) && rows.length === 0)) {
      return res.json(TSHIRT_COLLECTION.map(t => ({
        ...t,
        size: "M",
        price: 25,
      })));
    }
    return res.json(rows);
  } catch (err) {
    console.error("Error fetching products from DB, falling back to in-memory list:", err);
    return res.json(TSHIRT_COLLECTION.map(t => ({
      ...t,
      size: "M",
      price: 25,
    })));
  }
});

// ---

app.get("/", (req: Request, res: Response) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

process.on("SIGINT", () => {
  liveReloadServer.close();
  process.exit(0);
});
