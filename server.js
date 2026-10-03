const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");

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

async function initDatabase() {

    await pool.query(`
        CREATE TABLE IF NOT EXISTS vouchers (
            id SERIAL PRIMARY KEY,
            voucher TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log("Database ready");
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
            `
            INSERT INTO vouchers (voucher)
            VALUES ($1)
            RETURNING id, status, created_at
            `,
            [voucher]
        );

        res.json({
            success: true,
            message: "รับข้อมูลเรียบร้อย",
            transaction: result.rows[0]
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์"
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
