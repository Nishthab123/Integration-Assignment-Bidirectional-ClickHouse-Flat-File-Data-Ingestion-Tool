const clickhouseClient = require("../db");
const tryCatch = require("../utils/tryCatch");

const tableController = {};

tableController.getTables = tryCatch(async (req, res) => {
  const query = `
    SELECT
      database,
      name
    FROM system.tables
    WHERE database NOT IN ('system', 'INFORMATION_SCHEMA', 'information_schema')
    AND engine NOT LIKE 'Atomic%'
    `; // Exclude tables created by Atomic database engine
  const result = await clickhouseClient.query({ query });
  const data = await result.json();
  const tableNames = data.data.map((ele) => ele.name);
  return res.json(tableNames);
});

tableController.getTableData = tryCatch(async (req, res) => {
  const tableName = req.params.tableName;

  const query = `SELECT * FROM ${tableName}`;
  const result = await clickhouseClient.query({ query });
  const data = await result.json();
  return res.json(data.data);
});

tableController.deleteTable = tryCatch(async (req, res) => {
  const tableName = req.params.tableName;

  const query = `DROP TABLE ${tableName}`;
  await clickhouseClient.query({ query });
  return res.json({ message: `Table ${tableName} deleted successfully` });
});

tableController.createTable = tryCatch(async (req, res) => {
  const { tableName, schema } = req.body;

  if (!tableName || !schema) {
    return res
      .status(400)
      .json({ error: "Table name and schema are required" });
  }

  const query = `CREATE TABLE ${tableName} (${schema}) ENGINE = MergeTree() PRIMARY KEY (id)`;

  await clickhouseClient.query({ query });
  res.json({ message: `Table ${tableName} created successfully` });
});

tableController.insertTableData = tryCatch(async (req, res) => {
  const tableName = req.params.tableName;
  const { data } = req.body;

  if (!tableName || !data || !Array.isArray(data)) {
    return res
      .status(400)
      .json({ error: "Table name and data array are required" });
  }

  const columns = Object.keys(data[0]);
  let values = data.map((item) => columns.map((col) => item[col]));

  await clickhouseClient.insert({
    table: tableName,
    values: values,
  });

  res.json({ message: `Data inserted into ${tableName} successfully` });
});

module.exports = tableController;
