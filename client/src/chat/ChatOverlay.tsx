import React, { useState } from "react";
import Chat from "./Chat";
import ChatIcon from "./ChatIcon";
import CloseIcon from "./CloseIcon";
import "./chatOverlay.css";

const ChatOverlay = () => {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <div className="chat-overlay-wrapper">
      <div
        className={`chat-overlay-inner-wrapper ${
          chatVisible ? "chat-visible" : ""
        }`}
      >
        {chatVisible ? (
          <>
            <div
              className="close-icon-wrapper"
              onClick={() => setChatVisible(false)}
            >
              <CloseIcon />
            </div>
            <Chat />
          </>
        ) : (
          <button className="chat-button" onClick={() => setChatVisible(true)}>
            <ChatIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatOverlay;
