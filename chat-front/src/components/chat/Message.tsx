import { Socket } from "dgram";
import { useEffect, useState } from "react";

export interface IMessage {
  username: string;
  content: string;
  timeSent: string;
}

interface Props {
  message: IMessage;
  isMe: boolean;
  socket: Socket;
  language: string;
}

const Message = ({ message, isMe, socket, language }: Props) => {
  const [verificationData, setVerificationData] = useState("")
  const [infoStatus, setInfoStatus] = useState<"true" | "false" | "unverifiable">()

  const handleTranslate = (msg: any) => {
    console.log(language)
    socket.emit("translate-message", {msg, language})
  }

  const handleVerify = () => {
    socket.emit("verify-information", {message})
  }

  useEffect(() => {
    socket.on("verify-data", (data) => {
      if(data.message.timeSent === message.timeSent){
        setVerificationData(data.response)
        if(data.response.includes("This information can't be verified")){
          setInfoStatus("unverifiable")
        }
        if(data.response.includes("True")){
          setInfoStatus("true")
        }
        if(data.response.includes("False")){
          setInfoStatus("false")
        }
      }
    })
  }, [])

  return (
    <div className={`chat flex flex-col mx-5 gap-1 ${isMe ? "chat-end" : "chat-start"}`}>
      <div className="chat-header">
        {message.username}
        <time className="text-xs opacity-50">{message.timeSent}</time>
      </div>
      <div
        className={`chat-bubble ${
          isMe ? "chat-bubble-primary" : "chat-bubble-secondary"
        }`}
      >
        {message.content}
      </div>
      <div className="flex gap-2 items-center">
        <button className="btn btn-outline btn-xs" onClick={() => handleTranslate(message)}>Traduire</button>
        {!verificationData && <button className="btn btn-outline btn-accent btn-xs" onClick={handleVerify}>Verify</button>}
        {verificationData && 
        <div className={`chat flex`}>
          {infoStatus === "true" && <div className="text-lime-500">True</div>}
          {infoStatus === "false" && <div className="text-red-500">False</div>}
          {infoStatus === "unverifiable" && <div className="text-orange-500">Data can't be verified</div>}
        </div>
        } 
      </div>
    </div>
  );
};

export default Message;
