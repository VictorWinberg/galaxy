import Peer from "peerjs";
import { useEffect, useState } from "react";

function Chat() {
  const [peer, setPeer] = useState<Peer>();
  const [peerId, setPeerId] = useState<string>();
  const [connections, setConnections] = useState<Peer.DataConnection[]>([]);

  const [msg, setMsg] = useState<string>("");
  const [otherPeer, setOtherPeer] = useState<string>("");

  useEffect(() => {
    const peer = new Peer({ debug: 2 });
    setPeer(peer);
    peer.on("open", (id) => setPeerId(id));
    peer.on("connection", (conn) => {
      conn.on("open", () => {
        console.log("conn_inc::open");
        conn.send("hello!");
        setConnections([...connections, conn]);
      });
      conn.on("data", (data) => {
        console.log("conn_inc::data");
        console.log(data);
      });
    });
    peer.on("disconnected", () => {
      console.log("conn::disconnected");
    });
    peer.on("close", function () {
      console.log("peer::close");
    });
    peer.on("error", function (err) {
      console.log("peer::err", err);
    });
  }, []);

  function connectOtherPeer() {
    if (!peer) throw new Error("Initial peer unsuccessful");

    const conn = peer.connect(otherPeer);
    conn.on("open", () => {
      console.log("conn_oth::open");
      conn.send("hi!");
      setConnections([...connections, conn]);
    });
    conn.on("data", (data) => {
      console.log("conn_oth::data");
      console.log(data);
    });
  }

  function sendMsg() {
    connections.forEach((conn) => conn.send(msg));
  }

  return (
    <>
      <h1 style={{ color: "white" }}>Peer ID: {peerId}</h1>
      <input value={otherPeer} onChange={(e) => setOtherPeer(e.target.value)} />
      <button onClick={connectOtherPeer}>Connect</button>
      <br />
      <input value={msg} onChange={(e) => setMsg(e.target.value)} />
      <button onClick={sendMsg}>Send MSG</button>
    </>
  );
}

export default Chat;
