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

    constructor(address payable owner) ERC721("GalaxyToken", "NFT") {
        _owner = owner;
    }

    function mintToken(address to) public payable virtual {
        require(msg.value >= 10, "Not enough ETH sent; check price!");
        (bool sent, bytes memory data) = _owner.call{value: msg.value}("");
        require(sent, "Failed to send Ether");

        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(to, newItemId);
    }
}
