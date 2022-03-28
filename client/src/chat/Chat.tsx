/* eslint-disable react-hooks/exhaustive-deps */
import Peer from "peerjs";
import { useEffect, useState } from "react";

const HOST = "HOST";

function Chat() {
  const [peer, setPeer] = useState<Peer>();

  const [msg, setMsg] = useState<string>("");
  const [chat, setChat] = useState<string[]>([]);

  function initializePeer(_peer: Peer) {
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
  }

  function connectPeer(_peer: Peer, otherPeerId: string) {
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
  }

  function sendMsg() {
    if (!peer) throw new Error("Peer undefined");

    setChat((prev) => [...prev, `SEND: ${msg}`]);
    Object.values(peer.connections).forEach((connections: any) =>
      connections.forEach((c: Peer.DataConnection) => c.send(msg))
    );
  }

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
    <>
      <h1 style={{ color: "white" }}>Peer ID: {peer?.id}</h1>
      <input value={msg} onChange={(e) => setMsg(e.target.value)} />
      <button onClick={sendMsg}>Send MSG</button>
      <div id="chat" style={{ color: "white" }}>
        {chat.map((msg, idx) => (
          <p key={idx}>{msg}</p>
        ))}
      </div>
    </>
  );
}

export default Chat;
