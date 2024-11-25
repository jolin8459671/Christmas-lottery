const express = require("express");
const bodyParser = require("body-parser");
const sql = require("mssql");

// 建立 Express 應用程式
const app = express();
app.use(bodyParser.json());

// 資料庫連線設定
const dbConfig = {
    user: "sa", // 資料庫使用者名稱
    password: "123123", // 資料庫密碼
    server: "localhost", // 或伺服器 IP
    database: "LotteryDB", // 資料庫名稱
    options: {
        encrypt: false, // 如果是本地資料庫，設為 false
        trustServerCertificate: true, // 解決自簽名憑證問題
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
    const { id, result1, result2, result3 } = req.body; // 從請求中取得結果
    const timestamp = new Date(); // 記錄抽籤時間

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
