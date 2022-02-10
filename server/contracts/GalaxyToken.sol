//Contract based on [https://docs.openzeppelin.com/contracts/3.x/erc721](https://docs.openzeppelin.com/contracts/3.x/erc721)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract GalaxyToken is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address payable _owner;

    // Event to keep track of the minted Planets. 
    event MintedPlanet(string planetName, uint256 location, uint256 timestamp);

    struct Planet {
        string OwnerAddressName;
        address OwnerAddress;
        uint timestamp;
    }
    mapping(uint256 => Planet) claimedPlanets;
    mapping(address => uint256[]) userPlanets;

    constructor(address payable owner) ERC721("GalaxyToken", "NFT") {
        _owner = owner;
    }

    function mintToken(uint256 planetSeed, string calldata ownerName, address to)
        public
        payable
        virtual
    {
        require(!isClaimed(planetSeed), "Planet has already been claimed, nice try hacker, get lost.");
        //Payment
        require(msg.value >= 10, "Not enough ETH sent; check price!");
        (bool sent, bytes memory data) = _owner.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        // NFT 
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId);
        
        // Internal
        Planet memory p = Planet(ownerName,msg.sender, block.timestamp);
        claimedPlanets[planetSeed] = p;
        userPlanets[msg.sender].push(planetSeed);

        //Fire event
        emit MintedPlanet(ownerName, planetSeed, block.timestamp);
    }

    function isClaimed(uint256 planetSeed) public
        view
        returns (bool) {
        Planet memory planet = claimedPlanets[planetSeed];
        uint256 len = bytes(planet.OwnerAddressName).length;
        if (len > 0) {
            return true;
        }
        return false;
    }

    function getUserPlanets(address userAddress)
        public
        view
        returns (uint256[] memory)
    {
        return userPlanets[userAddress];
    }

    function getPlanet(uint256 planetSeed)
        public
        view
        returns (Planet memory)
    {
        return claimedPlanets[planetSeed];
    }
}
