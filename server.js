const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");
const path = require("path");

const app = express();
app.use(bodyParser.json());

// 提供靜態檔案
app.use(express.static(path.join(__dirname, "public")));

// 資料庫連線設定
const dbConfig = {
    user: "sa",
    password: "123123",
    server: "localhost",
    database: "LotteryDB",
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};

// 測試資料庫連線
async function testConnection() {
    try {
        await sql.connect(dbConfig);
        console.log("資料庫連線成功！");
    } catch (err) {
        console.error("資料庫連線失敗：", err.message);
    }
}
testConnection();

// POST API：儲存抽籤結果
app.post("/save-draw-result", async (req, res) => {
    const { id, result1, result2, result3 } = req.body;
    const timestamp = new Date();

    try {
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input("id", sql.NVarChar(50), id)
            .input("result1", sql.NVarChar(50), result1)
            .input("result2", sql.NVarChar(50), result2)
            .input("result3", sql.NVarChar(50), result3)
            .input("timestamp", sql.DateTime, timestamp)
            .query("INSERT INTO ResultData (Id, Result1, Result2, Result3, Timestamp) VALUES (@id, @result1, @result2, @result3, @timestamp)");

        res.status(200).send({ message: "抽籤結果已成功儲存！" });
    } catch (err) {
        console.error("儲存失敗：", err.message);
        res.status(500).send({ error: "儲存抽籤結果時出現錯誤" });
    }
});

// 啟動伺服器
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`伺服器正在執行，網址：http://localhost:${PORT}`);
});
