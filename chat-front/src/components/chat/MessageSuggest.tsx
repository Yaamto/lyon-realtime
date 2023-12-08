import React, { useEffect, useState } from 'react'

interface Props {
    username: string;
    socket: any;
    loader: boolean;
    setLoader: any;
  }
export default function MessageSuggest({username, socket, loader, setLoader}: Props) {
    const [messagesSuggestions, setMessagesSuggestions] = useState([])
    useEffect(() => {
        socket.on("suggest-message", (data: any) => {
            setMessagesSuggestions(JSON.parse(data).possibilities)
            setLoader(false)
          })
    },[])

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
  )
}
