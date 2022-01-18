import Web3 from "web3";
import "dotenv/config";

const { TEST_URL, USER_PUBLIC } = process.env as any;

const web3 = new Web3(TEST_URL);

async function getMyBalance() {
    const balance = await web3.eth.getBalance(USER_PUBLIC);
    console.log('user has', balance, 'wei');
}

getMyBalance()
