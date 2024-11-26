const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sql = require('mssql'); // 使用 mssql 套件

const app = express();
const port = 3000;

// 中間件
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // 提供靜態資源服務（如圖片）

// MSSQL 資料庫配置
const dbConfig = {
    user: 'myadmin_0712', // 您的管理員登入帳號
    password: 'Jolin@1223', // 您設置的密碼
    server: 'myazuresqlotterylserver.database.windows.net', // SQL Server 的完整名稱
    database: 'MyLotteryDB', // 資料庫名稱
    options: {
        encrypt: true, // Azure SQL 必須啟用加密
        trustServerCertificate: false
    }
};

// 測試資料庫連線
const testDBConnection = async () => {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('成功連接到 Microsoft Azure SQL 資料庫！');
        pool.close(); // 測試完成後關閉連線
    } catch (err) {
        console.error('資料庫連線失敗：', err);
    }
};
testDBConnection();

// API 路由
app.get('/', (req, res) => {
    res.send('伺服器已啟動！歡迎使用抽籤服務。');
});

// 儲存抽籤結果的 API
app.post('/save-draw-result', async (req, res) => {
    const { id, result1, result2, result3 } = req.body;

    if (!id || !result1) {
        return res.status(400).send('缺少必要的參數 id 或 result1');
    }

    try {
        const pool = await sql.connect(dbConfig);
        const query = `
            INSERT INTO result_data (id, result1, result2, result3, timestamp)
            VALUES (@id, @result1, @result2, @result3, GETDATE())
        `;

        await pool.request()
            .input('id', sql.VarChar, id)
            .input('result1', sql.VarChar, result1)
            .input('result2', sql.VarChar, result2 || null)
            .input('result3', sql.VarChar, result3 || null)
            .query(query);

        res.status(200).send('抽籤結果已成功儲存到資料庫');
    } catch (err) {
        console.error('儲存抽籤結果時出現錯誤：', err);
        res.status(500).send('儲存失敗，請稍後再試');
    }
});

// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器正在 http://localhost:${port} 運行`);
});
