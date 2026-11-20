function UserItem(props) {
    return (
        <div
            onClick={() => props.setSelectedUser(props.user)}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                props.selectedUser?._id === props.user._id
                    ? "bg-teal-100"
                    : props.isRecent
                    ? "bg-teal-50 hover:bg-teal-100"
                    : "hover:bg-gray-100"
            }`}
        >
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center relative shrink-0">
                <span className="text-teal-600 font-semibold">
                    {props.user.name.charAt(0).toUpperCase()}
                </span>

                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    props.user.status === "online" ? "bg-green-500" : "bg-gray-400"
                }`}></span>
            </div>

            <div className="min-w-0 flex-1">
                <h3 className={`text-gray-800 truncate ${
                    props.user.unreadCount > 0 ? "font-bold" : "font-semibold"
                }`}>
                    {props.user.name}
                </h3>

                {props.user.lastMessage && (
                    <p className={`text-sm truncate ${
                        props.user.unreadCount > 0
                            ? "font-bold text-gray-700"
                            : "text-gray-500"
                    }`}>
                        {props.user.lastMessage}
                    </p>
                )}
            </div>

            {props.user.unreadCount > 0 && (
                <span className="bg-teal-600 text-white text-xs font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center shrink-0">
                    {props.user.unreadCount}
                </span>
            )}
        </div>
    );
}

export default UserItem;