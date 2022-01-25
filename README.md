# Web3

## Prerequisite

- Node v14
- Typescript
- Truffle [[see Truffle Setup](#truffle-setup)]
- Ganache [[see Ganache Setup](#ganache-setup)]

## Environment variables

There are a env-file in root that you need to create locally:
> You can copy the `.env.example` to `.env` and modify the variables as needed

## Truffle Setup
_Truffle is the service allowing us to run migrate smart contracts on the blockchain_

Install truffle to machine by running the following commad: <br />
`npm install -g truffle` or `sudo npm install -g truffle`

Run the following commad to migrate your first smart contract to the blockchain: <br/>
`truffle migrate` <br/>
This will compile your smart contracts and migrate them to the development network <br/>
See the `truffle-config.js` for more info about the settings.<br>
Now you should see that one account has lesser eth, under "Contracts" the "Migration" contraction is deployed to the network.


## Ganache Setup
_Ganache is the service running the blockchain server that hosts your transaction history and chain state_

**Recommended:** Install Ganache by downloading and running the installer from: <br />
`https://trufflesuite.com/ganache/`
<br/>
Start the ganache app and create a fake-blockchain by the "Quickstart" options. <br />
To see you contracts in genache, go to settings and then "Add Project", locate the `truffle-config.js` and add that it to the project workspace. Then press "Restart". <br/>

**Alternative (without UI):**
Simply run the following command:
```
node ganache.js
```
> This uses the environment variables in `.env` with the `GANACHE` prefix

## Node Setup

```
npm install
npm start
```
