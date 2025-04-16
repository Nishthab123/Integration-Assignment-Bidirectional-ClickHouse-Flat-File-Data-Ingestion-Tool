const express = require("express");
const tablesRouter = express.Router();
const tableController = require("../controller/tableController");

tablesRouter.get("/tables", tableController.getTables);
tablesRouter.get("/tables/:tableName", tableController.getTableData);
tablesRouter.delete("/tables/:tableName", tableController.deleteTable);
tablesRouter.post("/tables", tableController.createTable);
tablesRouter.post("/tables/:tableName/data", tableController.insertTableData);

module.exports = tablesRouter;
