function MessageList(props) {
    return (
        <div className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">


            {props.messages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        {props.selectedUser
                            ? `Start chatting with ${props.selectedUser.name}`
                            : "Start a conversation"}
                    </h2>


                    <p className="text-gray-500 mt-2">
                        {props.selectedUser
                            ? `You are now chatting with ${props.selectedUser.name}`
                            : "Select a user from the sidebar to begin chatting"}
                    </p>
                </div>
            )}

            {props.messages.map((message, index) => (

                <div
                    key={index}
                    className={`${message.senderId === props.currentUser.userId
                            ? "self-end bg-teal-500 text-white"
                            : "self-start bg-gray-300 text-gray-800"
                        } px-4 py-2 rounded-2xl mb-2 max-w-xs`}
                >
                    {message.message}
                </div>
            ))}
        </div>
    );
}

export default MessageList;