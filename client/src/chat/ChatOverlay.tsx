import React, { useState } from "react";
import styled, { css } from "styled-components";
import Chat from "./Chat";
import ChatIcon from "./ChatIcon";

const Wrapper = styled.div<{ chatVisible: boolean }>`
  position: absolute;
  width: 100%;
  z-index: 100;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  ${({ chatVisible }) =>
    chatVisible
      ? css`
          background-color: rgba(185, 187, 182, 0.5);
        `
      : css`
          display: flex;
        `}
`;

const ChatButton = styled.button`
  padding: 0px;
`;

const ChatOverlay = () => {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <Wrapper chatVisible={chatVisible}>
      {chatVisible ? (
        <Chat />
      ) : (
        <ChatButton onClick={() => setChatVisible(true)}>
          <ChatIcon />
        </ChatButton>
      )}
    </Wrapper>
  );
};

export default ChatOverlay;
