// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract BlockChat {

    address owner;

    // Events
    // Triggers when new messages is posted to blockchain
    event NewMessage(string message, address user, uint timestamp, string roomName);

    struct Message {
        string message;
        address user;
        uint timestamp;
    }

    mapping(string => Message[]) messages;
    mapping(address => string) addressToUsername;
     mapping(address => string) addressToUsernaqme;

    constructor() {
        owner = msg.sender;
    }
    // Send a message to a room and fire an event to be caught by the UI
    function sendMessage(string calldata _msg, string calldata  _roomName) public {
        Message memory message = Message(_msg, msg.sender, block.timestamp);
        messages[_roomName].push(message);
        emit NewMessage(_msg, msg.sender, block.timestamp, _roomName);
    }
        // Send a message to a room and fire an event to be caught by the UI
    function qweqwe(string calldata _msg, string calldata  _roomName) public {
        Message memory message = Message(_msg, msg.sender, block.timestamp);
        messages[_roomName].push(message);
        emit NewMessage(_msg, msg.sender, block.timestamp, _roomName);
    }

    // Functions for creating and fetching custom usernames. If a user updates
    // their username it will update for all of their messages
    function createUser(string calldata _name) external {
        addressToUsername[msg.sender] = _name;
    }
    // There is no support for returning a struct to web3, so this needs to be
    // returned as multiple items. This will throw an error if the index is invalid
    function getMessageByIndexForRoom(string calldata _roomName, uint _index) public view returns (string memory, address, uint) {
        Message memory message = messages[_roomName][_index];
        return (message.message, message.user, message.timestamp);
    }
}