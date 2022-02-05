const GalaxyToken = artifacts.require("GalaxyToken");

module.exports = function (deployer) {
  deployer.deploy(GalaxyToken,'{ownerAddress}'); //0xF41AD8b25F384c52d322bd073ec1c83A531e1Bc2
};