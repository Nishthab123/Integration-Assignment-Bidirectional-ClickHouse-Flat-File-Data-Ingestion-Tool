const clickhouseClient = require("../db");

async function testConnection() {
  try {
    const result = await clickhouseClient.ping();
    console.log("ClickHouse connection successful:", result);
  } catch (error) {
    console.error("Error connecting to ClickHouse:", error);
  }
}

module.exports = {
  testConnection,
};
