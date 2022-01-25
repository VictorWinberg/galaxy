const ganache = require("ganache");
require("dotenv").config();

const { GANACHE_PORT, GANACHE_SEED, GANACHE_CHAIN_ID } = process.env;

const options = {
  seed: GANACHE_SEED || "random_seed",
  db_path: "blockchain",
  account_keys_path: ".secrets",
  chainId: GANACHE_CHAIN_ID || 1337,
};
const server = ganache.server(options);
const PORT = Number(GANACHE_PORT || 7545);
server.listen(PORT, async (err) => {
  if (err) throw err;

  console.log(`Ganache listening on port ${PORT}...`);
  const provider = server.provider;
  const accounts = await provider.request({
    method: "eth_accounts",
    params: [],
  });
  console.log(`\nAccounts\n============\n${accounts.join("\n")}\n`);

  const gasPrice = await provider.request({
    method: "eth_gasPrice",
    params: [],
  });
  console.log(`\nGAS PRICE\n============\n${gasPrice}\n`);

  const blockNumber = await provider.request({
    method: "eth_blockNumber",
    params: [],
  });
  console.log(`\nBLOCK NUMBER\n============\n${blockNumber}\n`);

  console.log();
});
