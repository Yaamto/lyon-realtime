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
}

const Message = ({ message, isMe, socket }: Props) => {
  const [verificationData, setVerificationData] = useState("")
  const [infoStatus, setInfoStatus] = useState<"true" | "false" | "unverifiable">()
  const options = ["French", "English", "German", "Arabic", "Norvegian", "Spanish", "Italian", "Russian", "Chinese", "Japanese"]

  const handleTranslate = (msg: any, language: any) => {
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
      <select className="select select-bordered " onChange={(e) => handleTranslate(message, e.target.value)}>
            <option disabled selected>Translate</option>
            {options.map((option) => (
              <option value={option}>{option}</option>
            ))}
      </select>
      <button className="btn btn-outline btn-accent btn-xs" onClick={handleVerify}>Verify</button>
      {verificationData && 
      <div className={`chat flex ${isMe ? "self-end" : "self-start"}`}>
        {infoStatus === "true" && <div className="chat-bubble chat-bubble-success">{verificationData}</div>}
        {infoStatus === "false" && <div className="chat-bubble chat-bubble-error">{verificationData}</div>}
        {infoStatus === "unverifiable" && <div className="chat-bubble chat-bubble-warning">{verificationData}</div>}
      </div>
      } 
    </div>
  );
};

export default Message;
