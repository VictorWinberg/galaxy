const ganache = require("ganache");
require("dotenv").config()

const options = {
  seed: process.env.SEED || "random_seed",
  db_path: "blockchain",
  account_keys_path: ".secrets",
  chainId: 1234
};
const server = ganache.server(options);
const PORT = 7555;
server.listen(PORT, async (err) => {
  if (err) throw err;

  console.log(`Ganache listening on port ${PORT}...`);
  const provider = server.provider;
  const accounts = await provider.request({
    method: "eth_accounts",
    params: [],
  });
  console.log(`Accounts\n============\n${accounts.join("\n")}\n`);

  const gasPrice = await provider.request({
    method: "eth_gasPrice",
    params: [],
  });
  console.log(`GAS PRICE\n============\n${gasPrice}\n`);

  const blockNumber = await provider.request({
    method: "eth_blockNumber",
    params: [],
  });
  console.log(`BLOCK NUMBER\n============\n${blockNumber}\n`);

  console.log();
});
