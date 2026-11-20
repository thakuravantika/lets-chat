
import { useState, useEffect } from "react";
import UserItem from "./UserItem";
import socket from "../socket";

function sortUsersByRecentMessage(users) {
  return [...users].sort((a, b) => {
    const timeA = a.lastMessageAt
      ? new Date(a.lastMessageAt).getTime()
      : 0;

    const timeB = b.lastMessageAt
      ? new Date(b.lastMessageAt).getTime()
      : 0;

    return timeB - timeA;
  });
}

function UserList(props) {
  const [users, setUsers] = useState([]);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(props.searchText.toLowerCase()) ||
    user.email.toLowerCase().includes(props.searchText.toLowerCase())
  );

  useEffect(() => {
    if (!props.currentUser?.userId) return;

    fetch(
      `http://127.0.0.1:5000/users?currentUserId=${props.currentUser.userId}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to fetch users");
        }
        return response.json();
      })
      .then((data) => {
        setUsers(sortUsersByRecentMessage(data));
      })
      .catch((error) => {
        console.log("Error fetching users:", error);
      });

    const handleUserStatus = (data) => {
      console.log("Received user_status:", data);
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === data.userId
            ? { ...user, status: data.status }
            : user
        )
      );
    };

    const handleSidebarUpdate = (data) => {
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) =>
          user._id === data.userId
            ? {
              ...user,
              lastMessage: data.lastMessage ?? user.lastMessage,
              lastMessageAt: data.lastMessageAt ?? user.lastMessageAt,
              unreadCount: data.unreadCount ?? user.unreadCount
            }
            : user
        );

        return sortUsersByRecentMessage(updatedUsers);
      });
    };

    socket.on("user_status", handleUserStatus);
    socket.on("sidebar_update", handleSidebarUpdate);

    return () => {
      socket.off("user_status", handleUserStatus);
      socket.off("sidebar_update", handleSidebarUpdate);
    };
  }, [props.currentUser?.userId]);

  return (
    <div className="mt-4 min-w-0">
      {filteredUsers.map((user, index) => (
        <UserItem
          key={user._id}
          user={user}
          setSelectedUser={props.setSelectedUser}
          selectedUser={props.selectedUser}
          isRecent={index === 0 && Boolean(user.lastMessageAt)}
        />
      ))}
    </div>
  );
}

export default UserList;
