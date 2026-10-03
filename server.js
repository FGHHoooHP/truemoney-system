const express = require("express");
const { Pool } = require("pg");
const crypto = require("crypto");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, x-admin-token"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const adminTokens = new Set();

async function initDatabase() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS vouchers (
            id SERIAL PRIMARY KEY,
            voucher TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log("Database connected");
}

function checkAdmin(req, res, next) {

    const token = req.headers["x-admin-token"];

    if (!token || !adminTokens.has(token)) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    next();
}

app.get("/", (req, res) => {

    res.json({
        status: "online",
        message: "TrueMoney Backend"
    });

});

app.get("/api/voucher", (req, res) => {

    res.json({
        success: true,
        message: "Voucher API is online"
    });

});

app.post("/api/admin/login", (req, res) => {

    const { password } = req.body;

    if (!ADMIN_PASSWORD) {
        return res.status(500).json({
            success: false,
            message: "ADMIN_PASSWORD is not configured"
        });
    }

    if (password !== ADMIN_PASSWORD) {
        return res.status(401).json({
            success: false,
            message: "รหัสผ่านไม่ถูกต้อง"
        });
    }

    const token = crypto.randomBytes(32).toString("hex");

    adminTokens.add(token);

    res.json({
        success: true,
        token
    });

});

app.post("/api/voucher", async (req, res) => {

    try {

        const { voucher } = req.body;

        if (!voucher) {
            return res.status(400).json({
                success: false,
                message: "กรุณาใส่ลิงก์ซองก่อน"
            });
        }

        const result = await pool.query(
            `INSERT INTO vouchers (voucher)
             VALUES ($1)
             RETURNING id, voucher, status, created_at`,
            [voucher]
        );

        console.log("Received voucher:", voucher);

        res.json({
            success: true,
            message: "ได้รับลิงก์ซองแล้ว",
            data: result.rows[0]
        });

    } catch (error) {

        console.error("Voucher error:", error);

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์"
        });

    }

});

app.get("/api/admin/vouchers", checkAdmin, async (req, res) => {

    try {

        const result = await pool.query(
            `SELECT id, voucher, status, created_at
             FROM vouchers
             ORDER BY id DESC`
        );

        res.json({
            success: true,
            count: result.rows.length,
            vouchers: result.rows
        });

    } catch (error) {

        console.error("Admin error:", error);

        res.status(500).json({
            success: false,
            message: "ไม่สามารถโหลดรายการได้"
        });

    }

});

const PORT = process.env.PORT || 3000;

initDatabase()
    .then(() => {

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    })
    .catch(error => {

        console.error("Database error:", error);
        process.exit(1);

    });
