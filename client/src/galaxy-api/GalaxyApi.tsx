import Web3 from "web3"

const galaxyABI = require("../output/GalaxyToken.json")
interface PlanetAddress {
    address: string
}

class GalaxyAPI { 
    web3: Web3
    contractAddress: string
    constructor(provider: string, _contractAddress:string) {
        this.web3 = new Web3(provider)
        this.contractAddress = _contractAddress
      }

      mintToken () {
          const contract =  new this.web3.eth.Contract(galaxyABI, this.contractAddress);
      }
      async getUserPlanets(userAddress:string){
        const contract =  new this.web3.eth.Contract(galaxyABI, this.contractAddress);
        const userPlanets = await contract.methods.getUserPlanets(userAddress).call();
        return userPlanets
      }
}

export default GalaxyAPI