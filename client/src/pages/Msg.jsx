import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "../stores/authStore";

const Msg = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const wsRef = useRef(null);

  const accessToken = useAuthStore((state) => state.accessToken)

  // 1. Fetch user list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/users/premium", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  // 2. Handle clicking on a user
  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    setRoomName(null);

    // Close old websocket if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      // Step 1: Create or get chat room
      const roomRes = await fetch("http://localhost:8000/api/chat/room/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ user2_id: user.id }),
      });

      const roomData = await roomRes.json();
      console.log(roomData)
      const room = roomData.room_name;
      setRoomName(room);

      // Step 2: Get old messages
      const messageRes = await fetch(
        `http://localhost:8000/api/chat/room/${room}/messages/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const messageData = await messageRes.json();
      setMessages(messageData);

      // Step 3: Connect WebSocket
      const socket = new WebSocket(
        `ws://localhost:8000/ws/chat/${room}/?token=${accessToken}`
      );

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      };

      socket.onopen = () => {
        console.log("✅ WebSocket connected");
      };

      socket.onerror = (e) => console.error("❌ WebSocket error", e);

      socket.onclose = () => {
        console.log("❗WebSocket closed");
      };

      wsRef.current = socket;
    } catch (err) {
      console.error("Error setting up chat:", err);
    }
  };

  // 3. Send message through WebSocket
  const handleSend = () => {
    if (!input.trim() || !wsRef.current || wsRef.current.readyState !== 1)
      return;

    wsRef.current.send(JSON.stringify({ message: input }));
    setInput("");
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 border-r p-4 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Users</h2>
        {users.length === 0 ? (
          <div className="text-sm text-gray-500">No users available</div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className={`p-2 cursor-pointer rounded hover:bg-gray-200 ${
                selectedUser?.id === user.id ? "bg-blue-100" : ""
              }`}
            >
              {user.username}
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b font-semibold bg-white">
              Chat with {selectedUser.name}
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-sm text-gray-500">No messages yet</div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`max-w-xs px-3 py-2 rounded shadow ${
                      msg.sender_username === selectedUser.username
                        ? "bg-gray-300"
                        : "bg-blue-500 text-white self-end ml-auto"
                    }`}
                  >
                    {msg.message}
                    <div className="text-xs text-right text-gray-600">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t flex gap-2 bg-white">
              <input
                type="text"
                className="flex-1 border rounded px-3 py-2"
                placeholder="Type a message"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={handleSend}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default Msg;
