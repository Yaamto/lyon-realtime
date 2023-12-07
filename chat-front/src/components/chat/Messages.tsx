import { useEffect, useRef, useState } from "react";
import Message, { IMessage } from "./Message";

interface Props {
  messages: IMessage[];
  username: string;
  socket: any;
}
const Messages = ({ messages, username, socket }: Props) => {
  const messagesContainerRef: any = useRef(null);
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="h-[500px] bg-slate-700 overflow-auto w-1/2 mx-auto rounded-lg" ref={messagesContainerRef}>
      {messages.map((msg) => (
        <div key={msg.timeSent} className="">
          <Message message={msg} isMe={msg.username === username} socket={socket} />
        </div>
      ))}
    </div>
  );
};

export default Messages;
