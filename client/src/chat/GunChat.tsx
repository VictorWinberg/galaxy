import { useEffect, useMemo } from "react";
import GUN from "gun";

function GunChat() {
  const db = useMemo(
    () => GUN(process.env.REACT_APP_GUN_URL || "http://localhost:8080/gun"),
    []
  );

  useEffect(() => {
    db.get("chat").once(async (data, id) => {
      console.log(data);
    });

    db.get("chat").get(new Date().toISOString()).put("Hello World!");
  }, []);

  return <></>;
}

export default GunChat;
