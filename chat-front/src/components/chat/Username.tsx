import { useState } from "react";
import { Socket } from "socket.io-client";

interface Props {
  socket: Socket;
  setUsername: (username: string) => void;
}

const Username = ({ socket, setUsername }: Props) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsername(text);
    socket.emit("username-set", {
      username: text,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="my-2">
      <h2 className="text-xl">Before chat, enter a username</h2>
      <div className="flex gap-2 mt-3">
      <input type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write an username..."
        className="input input-bordered w-full max-w-xs" />
      <button type="submit" className="btn btn-accent">Submit</button>
      </div>
    </form>
  );
};

export default Username;
