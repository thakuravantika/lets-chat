import {useState} from "react";

function MessageInput(props) {
  const [message, setMessage] = useState("");
  const handleSend = () => {
    if (message.trim()=== ""){
      return;
    }
    props.onSend(message);

    setMessage("");
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">

      <div className="flex items-center gap-3">

        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.currentTarget.value)}
          className="flex-1 min-w-0 w-full px-4 py-3 border-gray-300 rounded-full outline-none focus:border-teal-500"
        />

        <button
        onClick = {handleSend}
          className="shrink-0 bg-teal-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-600 transition"
        >
          Send
        </button>

      </div>

    </div>
  );
}

export default MessageInput;
