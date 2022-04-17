/* eslint-disable react-hooks/exhaustive-deps */
import Peer from "peerjs";
import { useEffect, useState } from "react";
import styled from "styled-components";

const HOST = "HOST";
const HostInfoWrapper = styled.div`
  justify-content: center;
  display: flex;
  margin-top: 24px;
`;

const Wrapper = styled.div`
  width: 100%;
`;

const MessageField = styled.input`
  border-radius: 8px;
  height: 32px;
  font-size: 16px;
  width: 40%;
  border: none;
`;

const MessageContainer = styled.div`
  width: 100%;
  color: #fafafa;
  height: 75vh;
  overflow: scroll;
  display: flex;
  margin: 0px 16px;
  flex-direction: column;
`;

const Message = styled.p`
  margin: 8px 0px;
`;

const SendButton = styled.button`
  border-radius: 8px;
  background-color: #fff;
  height: 32px;
  margin-left: auto;
  font-weight: 600;
  margin-left: 16px;
  border: none;
`;

const InputWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 8px;
`;

const Chat = () => {
  const [peer, setPeer] = useState<Peer>();

  const [msg, setMsg] = useState<string>("");
  const [chat, setChat] = useState<string[]>([]);

  const initializePeer = (_peer: Peer) => {
    _peer.on("open", () => {
      setPeer(_peer);

      if (peer) {
        Object.keys(peer.connections).forEach((peerId) =>
          connectPeer(_peer, peerId)
        );
        peer.destroy();
      }
    });
    _peer.on("connection", (conn) => {
      conn.on("open", () => {
        console.log("conn_inc::open");
      });
      conn.on("data", (data) => {
        console.log("conn_inc::data", data);
        setChat((prev) => [...prev, `RECEIVED: ${JSON.stringify(data)}`]);

        if (_peer.id === HOST && data.method === "GET_CONNECTIONS") {
          const payload = Object.entries(_peer.connections)
            .filter(([_, value]: any) => value.length > 0)
            .map(([key]) => key);

          conn.send({
            method: "SET_CONNECTIONS",
            payload,
          });
        }
      });
      conn.on("close", () => {
        console.log("conn_inc::close");
      });
    });
    _peer.on("disconnected", () => {
      console.log("conn::disconnected");
    });
    _peer.on("close", function () {
      console.log("peer::close");
    });
    _peer.on("error", function (err) {
      if (err.type === "peer-unavailable") {
        initializePeer(new Peer(HOST, { debug: 2 }));
      } else {
        console.log("peer::err", err.type);
      }
    });
  };

  const connectPeer = (_peer: Peer, otherPeerId: string) => {
    if (!_peer) throw new Error("Peer undefined");
    if (
      otherPeerId === _peer.id ||
      Object.keys(_peer.connections).includes(otherPeerId)
    )
      return;

    const conn = _peer.connect(otherPeerId);
    conn.on("open", () => {
      console.log("conn_peer::open");

      if (otherPeerId === HOST) {
        const obj = { method: "GET_CONNECTIONS" };
        conn.send(obj);
        setChat((prev) => [...prev, `SENT: ${JSON.stringify(obj)}`]);
      }
    });
    conn.on("data", (data) => {
      console.log("conn_peer::data", data);
      setChat((prev) => [...prev, `RECEIVED: ${JSON.stringify(data)}`]);

      if (conn.peer === HOST && data.method === "SET_CONNECTIONS") {
        data.payload.forEach((otherPeerId: string) =>
          connectPeer(_peer, otherPeerId)
        );
      }
    });
    conn.on("close", () => {
      console.log("conn_peer::close");

      if (otherPeerId === HOST) {
        const peer = new Peer(HOST, { debug: 2 });
        initializePeer(peer);
      }
    });
  };

  const sendMsg = () => {
    if (!peer) throw new Error("Peer undefined");

    setChat((prev) => [...prev, `SEND: ${msg}`]);
    Object.values(peer.connections).forEach((connections: any) =>
      connections.forEach((c: Peer.DataConnection) => c.send(msg))
    );
    setMsg("");
  };

  // initialize peer
  useEffect(() => {
    const peer = new Peer({ debug: 2 });
    initializePeer(peer);
    return Object.values(peer.connections).forEach((connections: any) =>
      connections.forEach((c: Peer.DataConnection) => c.close())
    );
  }, []);

  // connect to peer host or become host
  useEffect(() => {
    if (peer && peer.id !== HOST) {
      connectPeer(peer, HOST);
    }
  }, [peer]);

  return (
    <Wrapper>
      <HostInfoWrapper>
        <h3>Peer ID: {peer?.id}</h3>
      </HostInfoWrapper>
      <MessageContainer>
        {chat.map((msg, idx) => (
          <Message key={idx}>{msg}</Message>
        ))}
      </MessageContainer>
      <InputWrapper>
        <MessageField value={msg} onChange={(e) => setMsg(e.target.value)} />
        <SendButton onClick={sendMsg}>Send</SendButton>
      </InputWrapper>
    </Wrapper>
  );
};

export default Chat;
