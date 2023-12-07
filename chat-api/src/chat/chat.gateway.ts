import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import OpenAI from 'openai';

interface IMessage {
  username: string;
  content: string;
  timeSent: string;
}
const apiKey = "YourApiKey"
const openai = new OpenAI({
  apiKey: apiKey
});

async function TranslateMessage(language: String, message: IMessage ) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: `Translate this message in ${language} language only.` },
      { role: 'user', content: `message to translate: ${message.content}`}
    ],
    model: 'gpt-3.5-turbo',
  });
  message.content = chatCompletion.choices[0].message.content
  return message
}

async function VerifyInformation(message: IMessage) {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: `You are a genius and you know everything I will give you an information then tell me if the information is true or not. If true, just answer me this response : 'true'. If it's false, tell me the truth. If the information can't be verified, just answer this : "This information can't be verified"` },
      { role: 'user', content: `Following information: ${message.content}`}
    ],
    model: 'gpt-3.5-turbo',
  });
  return chatCompletion.choices[0].message.content
}

async function SuggestResponse(chat: IMessage[]){
  const messagesArray = chat.map((message) => {
    return message.content
  })
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: `I will give you a conversation which is in an array of messages,
        the messages are classified in order, can you suggest me at list 3 possible answers,
        only answer with the possibilities and convert them into json format with "possibilities" as attribute`},
      { role: 'user', content: `Array of messages: ${messagesArray}`}
    ],
    model: 'gpt-3.5-turbo',
  });
  return chatCompletion.choices[0].message.content
}

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Socket;

  clients: { client: Socket; username?: string }[] = [];
  chatMessages: IMessage[] = [];

  
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    this.server.emit('message', payload);
    console.log({ payload });
    return 'Hello world!';
  }

  @SubscribeMessage('chat-message')
  handleChatMessage(client: any, payload: IMessage): void {
    const c = this.clients.find((c) => c.client.id === client.id);
    if (c.username) {
      this.server.emit('chat-message', {
        ...payload,
        username: c.username,
      });
      this.chatMessages.push({
        ...payload,
        username: c.username,
      });
    }
  }

  @SubscribeMessage('username-set')
  handleUsernameSet(client: any, payload: any): void {
    const c = this.clients.find((c) => c.client.id === client.id);
    if (c) {
      c.username = payload.username;
    }
  }

  @SubscribeMessage('translate-message')
  async handleTranslate(client: any, message: any, language: any){
    const currentMessage = this.chatMessages.find(({timeSent}) => timeSent === message.msg.timeSent)
    // console.log(message)
   const currentMessageIndex =  this.chatMessages.findIndex((msg: any) => msg === currentMessage)
  //  console.log(currentMessageIndex)
    if(currentMessageIndex != -1){
      const messageTranslated = await TranslateMessage(message.language, currentMessage)
      // console.log(messageTranslated)
      this.chatMessages.splice(currentMessageIndex, 1, messageTranslated)
      this.server.emit('messages-old', this.chatMessages)
    }
  }

  @SubscribeMessage('verify-information')
  async handleVerifyInformation(client: any, payload: any){
    console.log(payload)
    const response = await VerifyInformation(payload.message)
    this.server.emit('verify-data', {response, message: payload.message	})
  }

  @SubscribeMessage('suggest-message')
  async handleSuggestResponse(client: any, payload: any){
    const response = await SuggestResponse(this.chatMessages)
    console.log(response)
    client.emit('suggest-message', response)
  }

  handleConnection(client: Socket) {
    console.log('client connected ', client.id);
    this.clients.push({
      client,
    });
    client.emit('messages-old', this.chatMessages);
  }

  handleDisconnect(client: any) {
    console.log('client disconnected ', client.id);
    this.clients = this.clients.filter((c) => c.client.id !== client.id);
  }


}
