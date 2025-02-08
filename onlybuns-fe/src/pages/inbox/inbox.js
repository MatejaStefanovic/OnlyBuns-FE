import React from 'react';
import styles from './inbox.module.css';
import { useState } from 'react';
import { useEffect } from 'react';
import { useUser } from '../../context/userContext';
import im  from '../../assets/images/nature.jpg'; 
import neww  from '../../assets/icons/circle.png'; 
import { useRef } from 'react';

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
function InboxPage() {


  const subscriptionRef = useRef(null);
  const [chatMessages, setChatMessages] = useState({}); 
  const [messageStatus, setMessageStatus] = useState('');
  const [chatDetails, setChatDetails] = useState({});
  const { user, token } = useUser();
  const username = user ?.username;

  const [selectedFriend, setSelectedFriend] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSelected, setChatSelected] = useState('');

  const [stompClient, setStompClient] = useState(null);

  const [selectedMssg, setSelectedMssg] = useState('');

  const[messages, setMessages] = useState([])
 /* const friends = [
    "Alice", "Bob", "Charlie", "David", "Emma", "Frank",
    "George", "Helen", "Isabella", "Jack", "Kate", "Liam",
    "Mike", "Nancy", "Oliver", "Peter"
  ];*/

  const[friends, setFr] = useState([]);
  const[chats, setC] = useState([]);

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

  
  useEffect(() => {
    fetch(`http://localhost:8080/api/mess/senders?username=${user.username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((chats) => setC(chats))
      .catch((error) =>
        console.error("Error fetching chats info:", error)
      );
  }, []);


  useEffect(() => {
    const fetchAllChatDetails = async () => {
      try {
        const responses = await Promise.all(
          chats.map((chat) =>
            fetch(`http://localhost:8080/api/mess/latest?sender=${chat}&receiver=${username}`)
              .then((res) => res.json())
              .catch(() => null) 
          )
        );
  
        const detailsMap = {};
        chats.forEach((chat, index) => {
          detailsMap[chat] = responses[index];
        });
  
        setChatDetails(detailsMap);
      } catch (error) {
        console.error("Error fetching chat details:", error);
      }
    };
  
    if (chats.length > 0) {
      fetchAllChatDetails();
    }
  }, [chats]); 

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

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }
     subscriptionRef.current  = client.subscribe(`/user/${username}/queue/messages`, (message) => {
      console.log(" Received message:", JSON.parse(message.body));
      const receivedMessage = JSON.parse(message.body);
  
      const chatKey = receivedMessage.senderUsername === username
      ? receivedMessage.receiverUsername
      : receivedMessage.senderUsername;

      setChatMessages((prev) => {
        const existingMessages = prev[chatKey] || [];
        const newMessageTime = new Date(receivedMessage.time).getTime() / 1000; // Convert to seconds
        const isDuplicate = existingMessages.some((msg) => {
        const existingTime = new Date(msg.time).getTime() / 1000;
    return (
      msg.senderUsername === receivedMessage.senderUsername &&
      msg.receiverUsername === receivedMessage.receiverUsername &&
      msg.content === receivedMessage.content &&
      Math.abs(existingTime - newMessageTime) < 1
    );
  });
        if (isDuplicate) {
          console.warn(" Duplicate message detected, skipping...");
          return prev;
        }

        return {
          ...prev,
          [chatKey]: [...(prev[chatKey] || []), receivedMessage],
        };
      });

      setC((prevChats) => {
        if (!prevChats.includes(chatKey)) {
          return [...prevChats, chatKey]; 
        }
        return prevChats;
      });
    });
  };

  client.onStompError = (frame) => {
    console.error("STOMP Error:", frame);
  };

  client.onDisconnect = () => {
    console.warn(" WebSocket disconnected");
  };

  client.activate();

  return () => {
    if (client.connected) {
      console.log(" WebSocket disconnecting...");
      client.deactivate();
      subscriptionRef.current .unsubscribe(); 
      subscriptionRef.current = null;
    }
  };
}, []);

function OpenChat(chat){
  setChatOpen(true);
  setChatSelected(chat);
  console.log("Opening chat with:", chat); // Debugging
  console.log("chatMessages:", chatMessages);
console.log("chatSelected:", chatSelected);
console.log("chatMessages[chatSelected]:", chatMessages[chatSelected]);

 
}

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
    
    setMessageStatus("Sending...");


    setChatMessages((prev) => ({
      ...prev,
      [selectedFriend]: [...(prev[selectedFriend] || []), message],
    }));
   
    try {
      stompClient.publish({
        destination: "/socket-subscriber/private-chat", 
        body: JSON.stringify(message),
        
      });
     
  
     
      alert('Message sent succesfully');
    } catch (error) {
      console.error("❌ Error sending message:", error);
      setMessageStatus("Error sending message...");
    }
  };
  /*const chats = [
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
  ];*/

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "";
  
    const dateObj = new Date(dateTimeString);
  
    const formattedTime = dateObj.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  
    const formattedDate = dateObj.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  
    return `${formattedTime} ${formattedDate}`;
  };
  
  function newMssg(){
    setChatSelected('');
    setChatOpen(false);
  }
return (
  <div className={styles.whole}>
  <div  className={styles.inb}> 
    <div className={styles.buttonss}>
      <button  className={styles.b}>Private Chats</button>
      <button  className={styles.b}>Group Chats</button>

    </div>
    <button className={styles.bu}>New Group</button>
    <button className={styles.bu} onClick={newMssg}>New Message</button>
    {chats.map((chat) => (
      <div  key={chat}    className={`${styles.mmessage}  ${chat.isRead ? styles.read : styles.unread}`} onClick={() => OpenChat(chat)}>
      
        <img src={im} className={styles.prof}></img>
        {chat}
        <span className={styles.dat}>{formatDateTime(chatDetails[chat]?.dateTime)}</span>
        { !chatDetails[chat]?.isRead && (
        < img src={neww} className={styles.neww}></img>
        )}
     {/*  { !chat.isRead && (
        < img src={neww} className={styles.neww}></img>
        )} */ } 
      </div>
    ))}
  </div>
  {chatOpen && (
  <div className={styles.second}>
    <div className={styles.chatWindow}>
      Chat with {chatSelected}
      {(chatMessages[chatSelected] || []).filter(
              (msg) =>
                (msg.senderUsername === username && msg.receiverUsername === chatSelected) ||
                (msg.senderUsername === chatSelected && msg.receiverUsername === username)
            ).map((msg, index) => (
              <div
                key={index}
                className={msg.senderUsername === username ? styles.sentMessage : styles.receivedMessage}
              >
                <p>{msg.senderUsername} : </p>
                <p>{msg.content}</p>
                <span>{new Date(msg.time).toLocaleTimeString()}</span>
              </div>
            ))}

    </div>
  </div>
)}


  { !chatOpen && (  <div className={styles.second}>
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
      
  </div> )}
  </div>
);
}

export default InboxPage;
