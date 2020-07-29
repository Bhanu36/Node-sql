const express = require("express");
const cors = require("cors");
var multer = require("multer");
var upload = multer({ dest: "uploads/" });
const csv = require("csvtojson");
const fs = require("fs")
const pool = require("./services/dbConn");

const app = express();

app.use(cors());

app.get("/", async (req, res) => {
  try {
    const SELECT_ALL = "SELECT * FROM sampleData";
    const data = await pool.query(SELECT_ALL);
    return res.status(200).json({
      code: 200,
      data: data,
    });
  } catch (err) {
    return res.status(200).json({
      code:400,
      message:err
    })
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    let data = await csv({ checkType: true, ignoreEmpty: true }).fromFile(
      filePath
    );
    data = data.map((a, i) => [
      a.Id || i,
      a.level,
      a.cvss,
      a.title,
      a.Vulnerability,
      a.Solution,
      a.reference,
    ]);
    const respo = await pool.query(
      "INSERT INTO sampleData (id,level,cvss,title,Vulnerability,Solution,reference) VALUES " +
        pool.escape(data)
    );
    await fs.unlink(filePath)
    return res.status(200).json({
      code: 200,
      message: respo,
    });
  } catch (err) {
    return res.status(200).json({
      data: err,
    });
  }
});

app.listen(4000, () => {
  console.log("server connected on 4000");
});
