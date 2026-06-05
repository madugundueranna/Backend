const cron = require("node-cron");
const http = require("http");

const backendUrls = ["https://backend-fw9m.onrender.com"];

const job = cron.schedule("*/14 * * * *", () => {
  console.log("Pinging servers to keep them alive...");

  backendUrls.forEach((backendUrl) => {
    http
      .get(backendUrl, (res) => {
        if (res.statusCode === 200) {
          console.log(`✅ Pinged ${backendUrl} successfully`);
        } else {
          console.error(
            ` Failed to ping ${backendUrl} - Status Code: ${res.statusCode}`
          );
        }
      })
      .on("error", (err) => {
        console.error(` Error pinging ${backendUrl}: ${err.message}`);
      });
  });
});

module.exports = job;
