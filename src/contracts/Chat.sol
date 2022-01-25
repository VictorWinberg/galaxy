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

    constructor() {
        owner = msg.sender;
    }
    // Send a message to a room and fire an event to be caught by the UI
    function sendMessage(string calldata _msg, string calldata  _roomName) public {
        Message memory message = Message(_msg, msg.sender, block.timestamp);
        messages[_roomName].push(message);
        emit NewMessage(_msg, msg.sender, block.timestamp, _roomName);
    }
    // Return all message in chatroom
    function getMessageByRoom(string calldata _roomName) public view returns (Message[] memory) {
        return messages[_roomName];
    }
}