const assert = require("assert");

const BlockChat = artifacts.require("BlockChat");

contract("BlockChat", (accounts) => {
  let token;

  before(async () => {
    token = await BlockChat.deployed();
  });
  it("should be deployed", () => {
    const address = token.address;
    assert.ok(address);
  });
  it("should send a message", async () => {
    const sendMessage = await token.sendMessage("Hello Blockchain!", "1");
    assert.notEqual(sendMessage, undefined);
  });
  it("should get all messages", async () => {
    const sendMessage = await token.sendMessage(
      "Well, hello there Mr.Chat!",
      "1"
    );
    const getMessages = await token.getMessageByRoom("1");

    assert.ok(sendMessage);
    assert.ok(getMessages);
    assert.equal(getMessages[1].message, "Well, hello there Mr.Chat!");
    assert.notEqual(getMessages.length, 0);
  });
});
