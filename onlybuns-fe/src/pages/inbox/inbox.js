import React from 'react';
import styles from './inbox.module.css';
import { useState } from 'react';
import { useEffect } from 'react';
import { useUser } from '../../context/userContext';
import im  from '../../assets/images/nature.jpg'; 
import send from '../../assets/icons/send-message.png'
import neww  from '../../assets/icons/circle.png'; 
import { useRef } from 'react';

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
function InboxPage() {


  const subscriptionRef = useRef(null);
  const [chatMessages, setChatMessages] = useState({}); 
  const [messageStatus, setMessageStatus] = useState('');
  const [flagGroupChat, setFlagGroupChat] = useState(false);
  const [chatDetails, setChatDetails] = useState({});
  const { user, token } = useUser();
  const username = user ?.username;
  const [groupMembers, setGroupMembers] = useState([]); 
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
function setGroupChatOpen(){
  setFlagGroupChat(!flagGroupChat);
}

  function markRead(){
    fetch(`http://localhost:8080/api/mess/read?sender=${chatSelected}&receiver=${username}`, {method:"POST"})
    .then((response)=>{
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setChatDetails((prevDetails) => ({
        ...prevDetails,
        [chatSelected]: { ...prevDetails[chatSelected], read: true },
      }));
      return response.json();
      
    }).catch((error) => console.error("Error marking messages as read:", error));
  }

  function poopulateChat(){
    fetch(`http://localhost:8080/api/mess/previousMessages?sender=${chatSelected}&receiver=${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((messages) => {
        const filteredkeys = messages.map((msg)=> {
          const chatKey= msg.senderUsername === username ? msg.receiverUsername : msg.senderUsername;
          return {...msg,chatKey};
        });

        setChatMessages((prev) => ({
          ...prev,
          [chatSelected]: filteredkeys,
        }));
    
      })
      .catch((error) => console.error("Error fetching previous messages:", error));
    
     
  };

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
        console.log("chatDetails:", chatDetails);
   
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
      console.log("selected", chatSelected);
      console.log("key:", chatKey);
      
      setChatDetails((prevDetails) => ({
        ...prevDetails,
        [chatKey]: { ...prevDetails[chatKey], read: false },
      }));
    
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
  poopulateChat();
  setSelectedFriend(chat);
  markRead();
  console.log("Opening chat with:", chat); // Debugging
  console.log("chatMessages:", chatMessages);
console.log("chatSelected:", chatSelected);
console.log("chatMessages[chatSelected]:", chatMessages[chatSelected]);
console.log("chatDetails[chat]:", chatDetails[chatSelected]);

 
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
     
  

    } catch (error) {
      console.error("❌ Error sending message:", error);
      setMessageStatus("Error sending message...");
    }
  };

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
   {flagGroupChat &&  ( <div className={styles.createGroup} >
      <p>Add friends: <select
  id="friend-select"
  multiple  
  value={groupMembers}
  onChange={(e) => setGroupMembers([...e.target.selectedOptions].map(option => option.value))}
  className={styles.friendSelect}
>
  <option value="" disabled>Select friends</option>
  {friends.map((friend, index) => (
    <option key={index} value={friend}>{friend}</option>
  ))}
</select></p>
      <p>Group name: <input type="text" placeholder='Write name'></input></p>
<button>Make</button>
    </div>
)}
    <div className={styles.buttonss}>
      <button  className={styles.b}>Private Chats</button>
      <button  className={styles.b}>Group Chats</button>

    </div>
    <button className={styles.bu}  onClick={setGroupChatOpen}>New Group</button>
    <button className={styles.bu} onClick={newMssg}>New Message</button>
    {chats.map((chat) => (
      <div  key={chat}    className={`${styles.mmessage}  ${chatDetails[chat]?.read ? styles.read : styles.unread}`} onClick={() => OpenChat(chat)}>
      
        <img src={im} className={styles.prof}></img>
        {chat}
        <span className={styles.dat}>{formatDateTime(chatDetails[chat]?.dateTime)}</span>
        { !chatDetails[chat]?.read && (
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
    <div> <div className={styles.inputmess}> <input type="text" placeholder="Write your message..." onChange={(e) => setSelectedMssg(e.target.value)}></input>  <button onClick={sendMessage} > <img src={send}></img></button></div></div>
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
