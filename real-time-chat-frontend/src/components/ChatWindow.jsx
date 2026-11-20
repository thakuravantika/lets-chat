import {useState, useEffect} from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import socket from "../socket";

function ChatWindow(props) {
const [ messagesByUser, setMessagesByUser ] = useState({});
const selectedMessages = messagesByUser[props.selectedUser?._id] || [];

const markMessagesRead = async () => {
  if (!props.selectedUser || !props.currentUser?.userId) {
    return;
  }

  try {
    await fetch("http://127.0.0.1:5000/messages/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentUserId: props.currentUser.userId,
        otherUserId: props.selectedUser._id,
      }),
    });
  } catch (error) {
    console.log("Mark messages read error:", error);
  }
};

useEffect(() => {
  if (!props.selectedUser){
  return;
}
markMessagesRead();

const fetchMessages = async () => {
  try{
    const response = await fetch(
      `http://127.0.0.1:5000/messages?senderId=${props.currentUser.userId}&receiverId=${props.selectedUser._id}`
    );

    const data = await response.json();

    if (response.ok) {
      setMessagesByUser((prevMessages) => ({
        ...prevMessages,
        [props.selectedUser._id]: data.map((item) => ({
          senderId: item.senderId,
          message: item.message,
          createdAt: item.createdAt,
        })),
      }));
    }
  }catch (error) {
    console.log("Fetch messages Error:",error);
    alert("Unable to load chat history!");
  }
};
fetchMessages();
}, [props.selectedUser?._id, props.currentUser?.userId]);


useEffect(() => {
  const handleReceiveMessage = (data)=> {
    setMessagesByUser((prevMessages) => ({
      ...prevMessages,
      [data.senderId]: [
        ...(prevMessages[data.senderId]|| []),
        {
          senderId: data.senderId,
          message: data.message,
          createdAt: data.createdAt,
        },
      ],
    }));

    if (data.senderId === props.selectedUser?._id){
      markMessagesRead();
    }
  };
  socket.on("receive_message", handleReceiveMessage);
  
  return () => {
    socket.off("receive_message", handleReceiveMessage);
  };

},[props.selectedUser?._id, props.currentUser?.userId]);


const handleSendMessage = async(message) => {
  let data;

  try {
    const response = await fetch("http://127.0.0.1:5000/messages",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId: props.currentUser.userId,
        receiverId: props.selectedUser._id,
        message: message,
      }),
    });

    data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }
  }catch (error) {
    console.log("Send message error:", error);
    alert("Unable to send message!");
    return;
  }

  socket.emit("send_message",{
    receiverId: props.selectedUser._id,
    messageId: data.messageId,
  });

  setMessagesByUser((prevMessages) => ({
    ...prevMessages,
    [props.selectedUser._id]: [
      ...(prevMessages[props.selectedUser._id] || []),
      {
        senderId: props.currentUser.userId,
        message: message,
        createdAt: data.createdAt,
      },
    ],
  }));
};

  
return (
  <div className="flex-1 min-w-0 h-full overflow-hidden bg-gray-50 flex flex-col">

    {props.selectedUser ? (
      <>
        <ChatHeader selectedUser={props.selectedUser}/>

        <MessageList
          selectedUser={props.selectedUser}
          messages={selectedMessages}
          currentUser={props.currentUser}
        />

        <MessageInput onSend={handleSendMessage}/>
      </>
    ) : (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">

          <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">💬</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800">
            Welcome to ChatConnect
          </h1>

          <p className="mt-3 text-gray-500 text-base leading-relaxed">
            Select a user from the sidebar to start a conversation.
          </p>

        </div>
      </div>
    )}

  </div>
);
}

export default ChatWindow;
