"use client";
import { useState } from "react";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  username: string;
}

const SendMessage = ({ socket, username }: Props) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    socket.emit("chat-message", {
      username,
      content: text,
      timeSent: new Date().toISOString(),
    });

    setText("");
  };
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a message..."
        className="input input-bordered w-full max-w-xs"
      />
      <button type="submit" className="btn btn-accent">Send</button>
    </form>
  );
};

export default SendMessage;
