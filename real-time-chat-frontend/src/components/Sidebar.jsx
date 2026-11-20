import { useState } from "react";
import UserList from "./UserList";

function Sidebar(props) {
    const [searchText, setsearchText] = useState("");
    return (
        <div className="w-full h-full flex flex-col overflow-hidden bg-white border-r border-gray-200 p-2 md:p-6">

            <div className="flex flex-col items-start gap-2 shrink-0 md:flex-row md:items-center md:justify-between">
                <h1 className="text-lg md:text-2xl font-bold text-teal-600  min-w-0">
                    Let's Chat
                </h1>

                <button
                    onClick={props.onLogout}
                    className="text-xs md:text-sm font-medium text-white bg-gray-900 border border-gray-900 px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors shrink-0"
                >
                    Logout
                </button>
            </div>

            <div className="mt-6 flex flex-col flex-1 min-h-0">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchText}
                    onChange={(e) => setsearchText(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg outline-none focus:border-teal-500 bg-white"
                />

                <div className="mt-8 shrink-0">
                    <h2 className="text-lg font-semibold text-gray-800">
                        Chats
                    </h2>

                    <div className="mt-4 border-t border-gray-200 flex-1 min-h-0 overflow-y-auto">
                        {/*users will appear here*/}
                        <UserList
                            setSelectedUser={props.setSelectedUser}
                            selectedUser={props.selectedUser}
                            searchText={searchText}
                            currentUser={props.currentUser}
                        />
                    </div>
                </div>
            </div>
        </div>



    );
}

export default Sidebar;