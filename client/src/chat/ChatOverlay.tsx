import React, { useState } from "react";
import styled, { css } from "styled-components";
import Chat from "./Chat";
import ChatIcon from "./ChatIcon";
import CloseIcon from "./CloseIcon";

const Wrapper = styled.div`
  position: absolute;
  width: 100%;
  z-index: 100;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const InnerWrapper = styled.div<{ chatVisible: boolean }>`
  display: flex;
  ${({ chatVisible }) =>
    chatVisible &&
    css`
      background-color: rgba(255, 240, 245, 0.3);
      height: 100%;
      width: 40%;
    `}
`;

const ChatButton = styled.button`
  padding: 0px;
  border-radius: 50%;
  height: 45px;
  width: 45px;
  border: none;
  cursor: pointer;
`;

const CloseIconWrapper = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  cursor: pointer;
`;

const ChatOverlay = () => {
  const [chatVisible, setChatVisible] = useState(false);

  return (
    <Wrapper>
      <InnerWrapper chatVisible={chatVisible}>
        {chatVisible ? (
          <>
            <CloseIconWrapper onClick={() => setChatVisible(false)}>
              <CloseIcon />
            </CloseIconWrapper>
            <Chat />
          </>
        ) : (
          <ChatButton onClick={() => setChatVisible(true)}>
            <ChatIcon />
          </ChatButton>
        )}
      </InnerWrapper>
    </Wrapper>
  );
};

export default ChatOverlay;
