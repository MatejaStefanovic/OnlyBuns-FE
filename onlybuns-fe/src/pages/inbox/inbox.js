import React from 'react';
import styles from './inbox.module.css';
import { useState } from 'react';
import { useEffect } from 'react';
import { useUser } from '../../context/userContext';
import im  from '../../assets/images/nature.jpg'; 
import neww  from '../../assets/icons/circle.png'; 


import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
function InboxPage() {


   const { user, token } = useUser();
      const username = user ?.username;
  const [selectedFriend, setSelectedFriend] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [selectedMssg, setSelectedMssg] = useState('');
 /* const friends = [
    "Alice", "Bob", "Charlie", "David", "Emma", "Frank",
    "George", "Helen", "Isabella", "Jack", "Kate", "Liam",
    "Mike", "Nancy", "Oliver", "Peter"
  ];*/

  const[friends, setFr] = useState([]);
useEffect(() => {
    fetch(`http://localhost:8080/api/users/following?username=${user.username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((friends) => setFr(friends))
      .catch((error) =>
        console.error("Error fetching following info:", error)
      );
  }, []);
///konekcija sa web socketom
useEffect(() => {
  const socket = new SockJS("http://localhost:8080/socket");
  const client = new Client({
    webSocketFactory: () => socket,
    debug: (msg) => console.log(msg),
    reconnectDelay: 5000, //rekonekt na svakih 5 sec
  });

  client.onConnect = () => {
    console.log("Connected to WebSocket server.");
    setStompClient(client);

    client.subscribe("/socket-publisher/private-chat", (message) => {
      console.log("📩 Received message:", JSON.parse(message.body));
    });
  };

  
  client.activate();

  return () => {
    if (client.connected) {
      client.deactivate();
    }
  };
}, []);



  const sendMessage = () => {
    if (!stompClient || !stompClient.connected) {
      console.error("WebSocket is not connected.");
      return;
    }

    if (!selectedFriend || !selectedMssg) {
      alert("Please select a friend and write a message.");
      return;
    }

    const message = {
      senderUsername: user.username,
      receiverUsername: selectedFriend,
      content: selectedMssg,
      time: new Date().toISOString().slice(0, 19),

    };

    console.log("Sending message:", message);

    try {
      stompClient.publish({
        destination: "/socket-subscriber/private-chat", 
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  };
  const chats = [
    { id: 1, receiverUsername: "Alice", senderUsername: "Bob", dateTime: "2024-01-30T10:15:00", isRead: true, content: "Hey Alice, how are you?" },
    { id: 2, receiverUsername: "Alice", senderUsername: "Charlie", dateTime: "2024-01-30T10:16:00", isRead: true, content: "Alice, let's meet up later." },
    { id: 3, receiverUsername: "Alice", senderUsername: "David", dateTime: "2024-01-30T10:17:00", isRead: false, content: "Alice, I sent you the report." },
    { id: 4, receiverUsername: "Alice", senderUsername: "Emma", dateTime: "2024-01-30T10:18:00", isRead: true, content: "Hey Alice, are you coming to the party?" },
    { id: 5, receiverUsername: "Alice", senderUsername: "Frank", dateTime: "2024-01-30T10:19:00", isRead: false, content: "Alice, do you have the project files?" },
    { id: 6, receiverUsername: "Alice", senderUsername: "George", dateTime: "2024-01-30T10:20:00", isRead: true, content: "Alice, can you help me with the code?" },
    { id: 7, receiverUsername: "Alice", senderUsername: "Helen", dateTime: "2024-01-30T10:21:00", isRead: true, content: "Alice, let's go for lunch!" },
    { id: 8, receiverUsername: "Alice", senderUsername: "Isabella", dateTime: "2024-01-30T10:22:00", isRead: false, content: "Alice, did you finish the project?" },
    { id: 9, receiverUsername: "Alice", senderUsername: "Jack", dateTime: "2024-01-30T10:23:00", isRead: true, content: "Alice, I sent you the invitation!" },
    { id: 10, receiverUsername: "Alice", senderUsername: "Kate", dateTime: "2024-01-30T10:24:00", isRead: false, content: "Alice, don't forget our meeting at 3." },
    { id: 11, receiverUsername: "Alice", senderUsername: "Liam", dateTime: "2024-01-30T10:25:00", isRead: true, content: "Alice, can you review my code?" },
    { id: 12, receiverUsername: "Alice", senderUsername: "Mike", dateTime: "2024-01-30T10:26:00", isRead: true, content: "Alice, let's schedule a call." },
    { id: 13, receiverUsername: "Alice", senderUsername: "Nancy", dateTime: "2024-01-30T10:27:00", isRead: false, content: "Alice, what time are you free?" },
    { id: 14, receiverUsername: "Alice", senderUsername: "Oliver", dateTime: "2024-01-30T10:28:00", isRead: true, content: "Alice, I need your feedback on my design." },
    { id: 15, receiverUsername: "Alice", senderUsername: "Peter", dateTime: "2024-01-30T10:29:00", isRead: false, content: "Alice, do you want to join our study session?" }
  ];


return (
  <div className={styles.whole}>
  <div  className={styles.inb}> 
    <div className={styles.buttonss}>
      <button  className={styles.b}>Private Chats</button>
      <button  className={styles.b}>Group Chats</button>

    </div>
    <button className={styles.bu}>New Group</button>
    {chats.map((chat) => (
     
      <div  key={chat.id}    className={`${styles.mmessage} ${chat.isRead ? styles.read : styles.unread}`}>
        <img src={im} className={styles.prof}></img>
        {chat.senderUsername}
        { !chat.isRead && (
        < img src={neww} className={styles.neww}></img>
        )}
      </div>
    ))}
  </div>
  <div className={styles.second}>
  <div className={styles.second1}>
          <label htmlFor="friend-select">To:</label>
          <select
            id="friend-select"
            value={selectedFriend}
            onChange={(e) => setSelectedFriend(e.target.value)}
            className={styles.friendSelect}
          >
            <option value="">Select a friend</option>
            {friends.map((friend, index) => (
              <option key={index} value={friend}>{friend}</option>
            ))}
          </select>
        </div>
        <div className={styles.second2}>
          <textarea type="text" placeholder="Write your message..." className={styles.messageInput} onChange={(e) => setSelectedMssg(e.target.value)}/>
        </div>
        <div><button onClick={sendMessage}>Send</button>
        </div>
  </div>
  </div>
);
}

export default InboxPage;
