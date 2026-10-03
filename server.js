const express = require("express");

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

const vouchers = [];

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

app.post("/api/voucher", (req, res) => {
    const { voucher } = req.body;

    if (!voucher) {
        return res.status(400).json({
            success: false,
            message: "กรุณาใส่ลิงก์ซองก่อน"
        });
    }

    const item = {
        id: vouchers.length + 1,
        voucher: voucher,
        status: "pending",
        createdAt: new Date().toISOString()
    };

    vouchers.push(item);

    console.log("Received voucher:", voucher);

    res.json({
        success: true,
        message: "ได้รับลิงก์ซองแล้ว",
        id: item.id
    });
});

app.get("/api/admin/vouchers", (req, res) => {
    res.json({
        success: true,
        count: vouchers.length,
        vouchers: vouchers
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
