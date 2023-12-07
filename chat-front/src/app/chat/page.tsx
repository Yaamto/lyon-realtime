"use client";
import Messages from "@/components/chat/Messages";
import SendMessage from "@/components/chat/SendMessage";
import Username from "@/components/chat/Username";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  autoConnect: false
});

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [messagesSuggestions, setMessagesSuggestions] = useState([])
  const [loader, setLoader] = useState(false)

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
    socket.on("suggest-message", (data) => {
      console.log(JSON.parse(data).possibilities)
      setMessagesSuggestions(JSON.parse(data).possibilities)
      setLoader(false)
    })
  }, []);

  const handleSuggestMessage = () => {
    setLoader(true)
    socket.emit("suggest-message", {username})
  }
  
  const handleSendSuggestMessage = (message: any) => {
    socket.emit("chat-message", {
      username,
      content: message,
      timeSent: new Date().toISOString(),
    });
    setMessagesSuggestions([])
  }

  
  return (
    <div>
      <h1>Chat</h1>
      {!username && <div className="flex justify-center"><Username socket={socket} setUsername={setUsername} /></div>}
      {username && <div><h2>Username : <b>{username}</b> </h2>
      <Messages messages={messages} username={username} socket={socket}/>
      <div className="flex justify-center mt-5">
        {username && <SendMessage  socket={socket} username={username} />}
      </div>
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2"> 
     {messagesSuggestions.length == 0 && <button className="btn btn-info" onClick={handleSuggestMessage}>Suggest answer</button>} 
      {loader && <span className="loading loading-spinner loading-md"></span>}
      {messagesSuggestions.length > 0 && <h2 className="text-center">Choose message to send !</h2>}
      {messagesSuggestions.length > 0 && <div className="flex mx-5 gap-3 justify-center">
          {messagesSuggestions.map((message) => (
            <button className="btn btn-primary" onClick={() => handleSendSuggestMessage(message)}>
              {message}
            </button>
          ))}
            <button className="btn btn-error" onClick={() => setMessagesSuggestions([])}>
              X
            </button>
        </div>
      }
      </div>
      </div>
}
    </div>
  );
};

export default Chat;
