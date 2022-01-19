import Web3 from "web3";
import "dotenv/config";
import { objContains } from "./utils";
const fetch = require("node-fetch");
const abiDecode = require("abi-decoder");
const ABI = require("./abi");
abiDecode.addABI(ABI);

const cryptoUrl =
  "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR,SEK,ETH";
const { MAIN_URL, TEST_URL, USER_PUBLIC } = process.env as any;

const web3 = new Web3(MAIN_URL);

async function main() {
  // let BLOCK_NUMBER = 14036160;
  let BLOCK_NUMBER: any = "latest";
  let PRICE: any;

  await (async () => {
    const res = await fetch(cryptoUrl);
    PRICE = await res.json();
    console.log("PRICE -->", PRICE);
  })();

  await (async () => {
    const block = await web3.eth.getBlock(BLOCK_NUMBER);
    if (!block) throw Error(`Block ${BLOCK_NUMBER} does not exist`);
    const { number, gasUsed, size, transactions } = block;
    BLOCK_NUMBER = number;
    const txAmount = transactions.length;
    console.log("BLOCK -->", { number, gasUsed, size, txAmount });
  })();

  await (async () => {
    const transactionHash =
      "0x4b11204b6be1e0d7c62002c483c005799a6c8de2676905affee7b4816759c347";
    const tx = await getTransactionDecoded(transactionHash);
    console.log("TX -->", tx);
  })();

  await (async () => {
    const balance = await web3.eth.getBalance(USER_PUBLIC);
    console.log("MY USER -->", web3.utils.fromWei(balance, "ether"), "eth");
  })();

  await (async () => {
    const USER_ADDRESS = "0x3f7B0dB87c7ec5a87629eF12b94dc9489F8630Cb";
    const WHERE = { from: USER_ADDRESS };
    const BLOCKS = 10;

    const userTx = await getTransactionsInterval(
      BLOCK_NUMBER - BLOCKS,
      BLOCK_NUMBER,
      WHERE
    );
    console.log(`USER ${USER_ADDRESS.slice(0, 8)} TRANSACTIONS -->`, userTx);
  })();

  await (async () => {
    const CONTRACT_ADDRESS = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const BLOCKS = 1;

    const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);
    const events = await contract.getPastEvents("allEvents", {
      fromBlock: BLOCK_NUMBER - BLOCKS + 1,
      toBlock: BLOCK_NUMBER,
    });
    console.log("CONTRACT PAST EVENTS -->", events.length);

    contract.events
      .allEvents()
      .on(
        "data",
        async ({ transactionHash: hash, blockNumber, event, ...rest }: any) => {
          const tx = await web3.eth.getTransaction(hash);
          const txReceipt = await web3.eth.getTransactionReceipt(hash);
          const { value: weiValue } = tx;
          const { gasUsed, effectiveGasPrice } = txReceipt;
          const value = Number(web3.utils.fromWei(weiValue, "ether"));
          const weiTxFee = gasUsed * effectiveGasPrice;
          const txFee = Number(web3.utils.fromWei(String(weiTxFee), "ether"));
          console.log(
            `B:${blockNumber}`,
            hash.slice(0, 8),
            `${event}`,
            `\tVALUE ${value.toFixed(4)}eth`,
            `${Math.round(value * PRICE.SEK)}SEK`,
            value > 0.001 ? "" : "\t",
            `\tFEE ${txFee.toFixed(4)}eth`,
            `${Math.round(txFee * PRICE.SEK)}SEK`
          );
        }
      )
      .on("changed", (changed: any) => console.log("CHANGED", changed))
      .on("connected", (str: any) => console.log("CONNECTED", str));
  })();
}

main();

async function getTransactionDecoded(transactionHash: string) {
  const tx = await web3.eth.getTransaction(transactionHash);
  if (tx == null) throw Error(`Transaction ${transactionHash} not found`);
  const { from, to, value, input: rawInput } = tx;
  const input = abiDecode.decodeMethod(rawInput);

  return { from, to, value, input: input || `${rawInput.slice(0, 10)}..` };
}

async function getTransactionsInterval(
  fromBlock: number,
  toBlock: number,
  where: any
) {
  // Not very optimal since it needs to scan through all the blocks
  return (
    await Promise.all(
      [...Array(toBlock - fromBlock + 1).keys()]
        .map((i) => fromBlock + i)
        .map(async (blockNr) => {
          const block = await web3.eth.getBlock(blockNr, true);
          if (!block) throw Error(`Block ${blockNr} does not exist`);
          return block.transactions
            .filter((tx) => objContains(where, tx))
            .map(({ from, to, value, input, ...rest }) => {
              const method = abiDecode.decodeMethod(input);
              return { from, to, value, method, ...rest };
            });
        })
    )
  ).flat();
}
