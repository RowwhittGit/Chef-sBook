import React, { useEffect, useRef, useState } from "react";
import useAuthStore from "../stores/authStore";
import { jwtDecode } from "jwt-decode";

const Msg = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roomName, setRoomName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const wsRef = useRef(null);

  const accessToken = useAuthStore((state) => state.accessToken);
  const decoded = jwtDecode(accessToken);
  const currentUserId = decoded.user_id || decoded.id; // Current user's ID

  // 1. Fetch user list
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/users/premium", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = await res.json();
        // Filter out current user from the list
        const filteredUsers = data.filter(user => user.id !== currentUserId);
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, [currentUserId]);

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
      console.log(roomData);
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
      console.log(messageData);

      // Step 3: Connect WebSocket
      const socket = new WebSocket(
        `ws://localhost:8000/ws/chat/${room}/?token=${accessToken}`
      );

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        
        // Handle different WebSocket message formats
        let newMessage;
        if (data.type === 'chat_message' && data.message) {
          // If the message is wrapped in a type structure
          newMessage = data.message;
        } else if (data.message) {
          // If it's a direct message object
          newMessage = {
            message: data.message,
            sender: data.sender || currentUserId, // Fallback to current user if sender not provided
            timestamp: data.timestamp || new Date().toISOString(),
            // Add other fields as needed
          };
        } else {
          // If it's just the raw data
          newMessage = data;
        }
        
        setMessages((prev) => [...prev, newMessage]);
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

    console.log(JSON.stringify({ message: input }));
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
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          ))
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b font-semibold bg-white">
              Chat with {selectedUser.username}
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-sm text-gray-500">No messages yet</div>
              ) : (
                messages.map((msg, idx) => {
                  // Check if message is from current user or receiver
                  const isFromCurrentUser = msg.sender === currentUserId;
                  
                  return (
                    <div
                      key={idx}
                      className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded shadow ${
                          isFromCurrentUser
                            ? "bg-blue-500 text-white" // Current user's messages (blue, right side)
                            : "bg-gray-300 text-black"  // Receiver's messages (gray, left side)
                        }`}
                      >
                        <div>{msg.message}</div>
                        <div className={`text-xs text-right mt-1 ${
                          isFromCurrentUser ? 'text-blue-100' : 'text-gray-600'
                        }`}>
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  );
                })
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
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
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