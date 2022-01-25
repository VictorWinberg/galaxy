import Web3 from "web3";
import "dotenv/config";
import fs from 'fs'
import { Configuration } from "./configuration/"

const config = new Configuration()


export const getmyContract = async () => {
    const web3 = new Web3(config.rpcServer)
    const jsonString = fs.readFileSync('./output/BlockChat.json').toString()
    const parsedJsonObject = JSON.parse(jsonString)
    var contract = new web3.eth.Contract(parsedJsonObject.abi, config.contractChatAddress);
    const accounts = await web3.eth.getAccounts()
    console.log(accounts)
    try {
        const sendMessageResponse = await contract.methods.sendMessage('Hej på block kedjan!', '1').send({
            from: config.myAddress,
            gas: '6721975'
        })
        console.log('sendMessage',sendMessageResponse)
    } catch (error) {
        console.log(error)
    }
    try {
        const getMessagesResponse = await contract.methods.getMessageByRoom('1').call({
            from: config.myAddress,
        })
        console.log('getMessage',getMessagesResponse)
    } catch (error) {
        console.log(error)
    }
}

getmyContract()