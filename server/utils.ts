import Web3 from "web3";
const fetch = require("node-fetch");
const abiDecode = require("abi-decoder");

export async function accounts(web3: Web3) {
  const accounts = await web3.eth.getAccounts();
  console.log("ACCOUNTS -->", accounts);
}

export async function getCryptoPrice() {
  const cryptoUrl = "https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR,SEK,ETH";
  const res = await fetch(cryptoUrl);
  const PRICE = await res.json();
  console.log("PRICE -->", PRICE);
  return { PRICE };
}

export async function checkBlock(web3: Web3, BLOCK_NUMBER: number | string) {
  const block = await web3.eth.getBlock(BLOCK_NUMBER);
  if (!block) throw Error(`Block ${BLOCK_NUMBER} does not exist`);
  const { number, gasUsed, size, transactions } = block;
  const txAmount = transactions.length;
  console.log("BLOCK -->", { number, gasUsed, size, txAmount });
  return { BLOCK_NUMBER: number };
}

export async function checkTransaction(web3: Web3, hash: string) {
  const tx = await getTransactionDecoded(web3, hash);
  console.log("TX -->", tx);
}

export async function userBalance(web3: Web3, address: string) {
  const balance = await web3.eth.getBalance(address);
  console.log("MY USER -->", web3.utils.fromWei(balance, "ether"), "eth");
}

export async function userTransactions(web3: Web3, address: string, BLOCK_NUMBER: number) {
  const WHERE = { from: address };
  const BLOCKS = 10;

  const userTx = await getTransactionsInterval(web3, BLOCK_NUMBER - BLOCKS, BLOCK_NUMBER, WHERE);
  console.log(`USER ${address.slice(0, 8)} TRANSACTIONS -->`, userTx);
}

export async function callContractMethods(web3: Web3, userAddress: string, contractABI: any, contractAddress: string) {
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  const method = contract.methods.sendMessage("Hello World!", "1");

  const gas = await method.estimateGas();
  console.log("estimateGas", gas);

  // const sendMessage = await method.send({ from: userAddress, gas });
  // console.log("sendMessage", sendMessage);

  const getMessage = await contract.methods.getMessageByIndexForRoom("1", 1).call({
    from: userAddress,
  });
  console.log("getMessage", getMessage);
}

export async function listenToContractEvents(web3: Web3, contractABI: any, contractAddress: string, BLOCK_NUMBER: number, { PRICE }: any) {
  const BLOCKS = 1;

  const contract = new web3.eth.Contract(contractABI, contractAddress);
  const events = await contract.getPastEvents("allEvents", {
    fromBlock: BLOCK_NUMBER - BLOCKS + 1,
    toBlock: BLOCK_NUMBER,
  });
  console.log("CONTRACT PAST EVENTS -->", events.length);

  contract.events
    .allEvents()
    .on("data", async ({ transactionHash: hash, blockNumber, event }: any) => {
      const tx = await web3.eth.getTransaction(hash);
      const txReceipt = await web3.eth.getTransactionReceipt(hash);
      if (!tx || !txReceipt) {
        return console.log(`B:${blockNumber}`, hash.slice(0, 8), `${event}`);
      }

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
    })
    .on("changed", (changed: any) => console.log("CHANGED", changed))
    .on("connected", (str: any) => console.log("CONNECTED", str));
}

async function getTransactionDecoded(web3: Web3, transactionHash: string) {
  const tx = await web3.eth.getTransaction(transactionHash);
  if (tx == null) throw Error(`Transaction ${transactionHash} not found`);
  const { from, to, value, input: rawInput } = tx;
  const input = abiDecode.decodeMethod(rawInput);

  return { from, to, value, input: input || `${rawInput.slice(0, 10)}..` };
}

export function objContains(parent: any, child: any): boolean {
  return Object.keys(parent).every((ele) => {
    if (typeof parent[ele] == "object") {
      return objContains(child[ele], parent[ele]);
    }
    return parent[ele] === child[ele];
  });
}

async function getTransactionsInterval(web3: Web3, fromBlock: number, toBlock: number, where: any) {
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

export async function mintToken(web3:Web3,contractABI:any, contractAddress:string,transferTokenToAddress:string) {
  const contract = new web3.eth.Contract(contractABI, contractAddress);
  

  contract.methods.mintToken(transferTokenToAddress).send({from: transferTokenToAddress,
    value: 10,
    gas: 1000000})
}
