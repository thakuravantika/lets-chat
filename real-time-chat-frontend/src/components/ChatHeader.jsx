
function ChatHeader(props) {

  console.log("ChatHeader selectedUser:", props.selectedUser);
  console.log("Name value:", props.selectedUser);
  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-6">


        {/* User Avatar */}
      <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
        <span className="text-teal-600 font-semibold">
          {props.selectedUser?.name?.charAt(0).toUpperCase() || "?"}
        </span>
      </div>

      {/* User Details */}
      <div className="ml-3">
        <h2 className="font-semibold text-gray-800">
          {props.selectedUser?.name || "Select a user"}
        </h2>

        <p className={`text-sm ${
  props.selectedUser?.status === "online"
    ? "text-green-500"
    : "text-gray-400"
}`}>
  {props.selectedUser?.status || "offline"}
</p>
      </div>


    </div>
  );
}

export default ChatHeader;
