import {useState} from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";


function Dashboard(props) {
    const [selectedUser, setSelectedUser] = useState(null);

   
    return(
        <div className="h-screen w-full overflow-hidden bg-gray-100 flex flex-row ">

              {/* Sidebar */}
            <div className="w-[35%] min-w-0 shrink md:w-80 md:shrink-0 h-full bg-white border-r border-gray-200">
                <Sidebar setSelectedUser={setSelectedUser} 
                selectedUser={selectedUser}
                currentUser={props.currentUser}
                onLogout={props.onLogout}
                />
            </div>


             {/* Chat Area */}

            <div className="flex-1 min-w-0 h-full overflow-hidden">
                <ChatWindow 
                selectedUser={selectedUser}
                currentUser={props.currentUser}
                />

            </div>
        </div>
    );
}

export default Dashboard;