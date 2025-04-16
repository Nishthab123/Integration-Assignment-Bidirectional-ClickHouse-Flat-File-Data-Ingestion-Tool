const { createClient } = require("@clickhouse/client");

const host = process.env.CLICKHOUSE_HOST || "localhost"; // Use the container name as the hostname within Docker network
const port = parseInt(process.env.CLICKHOUSE_PORT || "8123");
const username = process.env.CLICKHOUSE_USER || "default"; // Default user
const password = process.env.CLICKHOUSE_PASSWORD || "clickhouse"; // Default password (set in ClickHouse config if needed)

// ClickHouse Client Configuration
const clickhouseClient = createClient({
  url: `http://${host}:${port}`,
  username: username,
  password: password,
});

module.exports = clickhouseClient;
