const express = require("express");
const cors = require("cors");
const { testConnection } = require("./utils/clickhouse");
const tablesRouter = require("./routes/tables");

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

testConnection();

app.use("/api", tablesRouter);

app.listen(port, () => {
  console.log(`Node.js server listening on port ${port}`);
});
