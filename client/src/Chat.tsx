import Peer from "peerjs";
import { useEffect, useState } from "react";

const HOST = "HOST";

function Chat() {
  const [peer, setPeer] = useState<Peer>();

  const [msg, setMsg] = useState<string>("");
  const [chat, setChat] = useState<string[]>([]);

  function initializePeer(peer: Peer) {
    peer.on("open", () => {
      setPeer(peer);
    });
    peer.on("connection", (conn) => {
      conn.on("open", () => {
        console.log("conn_inc::open");
      });
      conn.on("data", (data) => {
        console.log("conn_inc::data", data);
        setChat((prev) => [...prev, `RECEIVED: ${JSON.stringify(data)}`]);

        if (peer.id === HOST && data.method === "GET_CONNECTIONS") {
          conn.send({ method: "SET_CONNECTIONS", payload: Object.keys(peer.connections) });
        }
      });
      conn.on("close", () => {
        console.log("conn_inc::close");
      });
    });
    peer.on("disconnected", () => {
      console.log("conn::disconnected");
    });
    peer.on("close", function () {
      console.log("peer::close");
    });
    peer.on("error", function (err) {
      if (err.type === "peer-unavailable") {
        initializePeer(new Peer(HOST, { debug: 2 }));
      } else {
        console.log("peer::err", err.type);
      }
    });
  }

  function connectPeer(peerId: string) {
    if (!peer) throw new Error("Peer undefined");
    if (peerId === peer.id || Object.keys(peer.connections).includes(peerId)) return;

    const conn = peer.connect(peerId);
    conn.on("open", () => {
      console.log("conn_peer::open");

      if (peerId === HOST) {
        const obj = { method: "GET_CONNECTIONS" };
        conn.send(obj);
        setChat((prev) => [...prev, `SENT: ${JSON.stringify(obj)}`]);
      }
    });
    conn.on("data", (data) => {
      console.log("conn_peer::data", data);
      setChat((prev) => [...prev, `RECEIVED: ${JSON.stringify(data)}`]);

      if (conn.peer === HOST && data.method === "SET_CONNECTIONS") {
        data.payload.forEach((peerId: string) => connectPeer(peerId));
      }
    });
    conn.on("close", () => {
      console.log("conn_peer::close");

      if (peerId === HOST) {
        const peer = new Peer(HOST, { debug: 2 });
        initializePeer(peer);
      }
    });
  }

  function sendMsg() {
    if (!peer) throw new Error("Peer undefined");

    setChat((prev) => [...prev, `SEND: ${msg}`]);
    Object.values(peer.connections).forEach((conn: any) => conn[0].send(msg));
  }

  // initialize peer
  useEffect(() => {
    const peer = new Peer({ debug: 2 });
    initializePeer(peer);
    return Object.values(peer.connections).forEach((conn: any) => conn[0].close());
  }, []);

  // connect to peer host or become host
  useEffect(() => {
    if (peer && peer.id !== HOST) {
      connectPeer(HOST);
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
