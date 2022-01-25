import Web3 from "web3";
import "dotenv/config";
import { getCryptoPrice, checkBlock, accounts, userBalance, callContractMethods } from "./utils";
import Config, { ENV } from "./configuration";
const BlockChat = require("../output/BlockChat.json");

Config.SET_ENV = ENV.LOCAL

const web3 = new Web3(Config.RPC_SERVER);

async function main() {
  await getCryptoPrice();
  await checkBlock(web3, "latest");
  await accounts(web3);
  await userBalance(web3, Config.USER_ADDRESS);
  await callContractMethods(web3, Config.USER_ADDRESS, BlockChat.abi, Config.CONTRACT_CHAT_ADDRESS)
}

main();
