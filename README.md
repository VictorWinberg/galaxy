# Web3


## Setting up truffle and ganache for local development
Install truffle to machine but running the following commad: <br />
`sudo npm install -g truffle`

Download and run the installer from: <br />
`https://trufflesuite.com/ganache/`
<br/>

Start the ganache app and create a fake-blockchain by the "Quickstart" options. <br />
To see you contracts in genache, go to settings and then "Add Project", locate the truffle-config.js and add that it to the project workspace. Then press "Restart". <br/>
Run the following commad to migrate your first smart contract to the blockchain: <br/>
`truffle migrate` <br/>
This will compile your smart contracts and migrate them to the development network <br/>
See the truffle-config.js for more info about the settings.<br>
Now you should see that one account has lesser eth, under "Contracts" the "Migration" contraction is deployed to the network.  
