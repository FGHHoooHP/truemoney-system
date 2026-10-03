const express = require("express");

const app = express();

app.use(express.json());

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
            message: "กรุณาใส่ลิงก์ซอง"
        });
    }

    res.json({
        success: true,
        message: "ได้รับลิงก์แล้ว",
        voucher: voucher
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
