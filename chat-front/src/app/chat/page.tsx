"use client";
import MessageSuggest from "@/components/chat/MessageSuggest";
import Messages from "@/components/chat/Messages";
import SendMessage from "@/components/chat/SendMessage";
import Translate from "@/components/chat/Translate";
import Username from "@/components/chat/Username";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false
});

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [loader, setLoader] = useState(false)
  const [language, setLanguage] = useState("")

  useEffect(() => {
    socket.connect()
    socket.on("connect", () => {
      console.log("connected", socket.id);
    });

    socket.on("messages-old", (data) => {
      console.log({data})
      setMessages((msg) => [msg, ...data] as any);
    });

    socket.on("chat-message", (data) => {
      setMessages((msg) => [...msg, data] as any);
    });
  }, []);
  
  return (
    <div>
      <h1>Chat</h1>
      {!username && <div className="flex justify-center"><Username socket={socket} setUsername={setUsername} /></div>}
      {username && <div> <h2>Username : <b>{username}</b></h2>
      <div className="text-center">
        <Translate language={language} setLanguage={setLanguage} />
      </div>
        <Messages messages={messages} username={username} socket={socket} language={language}/>
        <div className="flex justify-center mt-5">
          {username && <SendMessage  socket={socket} username={username} />}
        </div>
        <MessageSuggest loader={loader} socket={socket} setLoader={setLoader} username={username}  />
      </div>
      }
    </div>
  );
};

export default Chat;
