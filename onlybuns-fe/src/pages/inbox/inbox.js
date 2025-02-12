import React from 'react';
import styles from './inbox.module.css';
import { useState } from 'react';
import { useEffect } from 'react';
import { useUser } from '../../context/userContext';
import im  from '../../assets/images/nature.jpg'; 
import groupimg  from '../../assets/images/groupimg.png'; 
import send from '../../assets/icons/send-message.png'
import neww  from '../../assets/icons/circle.png'; 
import newGroup  from '../../assets/icons/add-group.png'; 
import newMess  from '../../assets/icons/pen.png'; 
import { useRef } from 'react';

import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
function InboxPage() {


  const subscriptionRef = useRef(null);
  const [chatMessages, setChatMessages] = useState({}); 
  const[memberAdding, setMemberAdding] = useState (false);
  const [messageStatus, setMessageStatus] = useState('');
  const [selectedGroupName, setSelectedGroupName] = useState('');
  const [flagGroupChat, setFlagGroupChat] = useState(false);
  const [privateChats, setPrivateChats] = useState(true);
  const [chatDetails, setChatDetails] = useState({});
  const [groupChatMess, setGroupChatMess] = useState(false);
  
  const { user, token } = useUser();
  const username = user ?.username;
  const [groupMembers, setGroupMembers] = useState([]); 
  const [groups, setGroups] = useState([]); 
  const [selectedFriend, setSelectedFriend] = useState('');
  const [friend, setFriend] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  const [chatOpen, setChatOpen] = useState(false);
  const [chatSelected, setChatSelected] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [selectedMssg, setSelectedMssg] = useState('');
  const[friends, setFr] = useState([]); 
  const[chats, setC] = useState([]);



  ///metoda kojom dobavljam sve one koje moj user prati
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

   ///metoda kojom dobavljam sve cetove tj posiljaoce poruka
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

///metoda kojom dobavljam sve grupe u kojima je moj korisnik
  useEffect(() => {
    fetch(`http://localhost:8080/api/mess/groupsForUser?username=${user.username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((groups) => setGroups(groups))
      .catch((error) =>
        console.error("Error fetching groups:", error)
      );
  }, []);

  ///metoda koja sluzi kao flag za to da li mi je otvoren prozorcic za kreiranje nove grupe
  function setGroupChatOpen(){
    setFlagGroupChat(!flagGroupChat);
    setSelectedGroupName('');
    setGroupMembers([]);
  }

  ///metoda koju pozivam za kreiranje nove grupe
  function makeGroup(){
    const group = {
      admin: user.username,
      groupName: selectedGroupName,

    };
    const usersParam = groupMembers.join(","); 
    fetch(`http://localhost:8080/api/mess/newGroup?users=${encodeURIComponent(usersParam)}`, {body:JSON.stringify(group),method:"PUT",headers: { "Content-Type": "application/json" },})
      .then((response)=>{
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
        
      }).catch((error) => console.error("Error creating new group:", error));
    setSelectedGroupName('');
    setFlagGroupChat(false);
    setGroupMembers([]);
  }

  ///metoda kojom oznacavam da su poruke u odredjenom cetu procitane
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

    ///metoda kojom kupim prethodne poruke iz ceta
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
  function populateGroupChat(group){
    fetch(`http://localhost:8080/api/mess/groupMessages?groupId=${group.id}&username=${username}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((messages) => {
      console.log("Loaded previous messages:", messages);

      setChatMessages((prev) => ({
        ...prev,
        [group.id]: messages,
      }));
    })
    .catch((error) => console.error(" Error fetching previous group messages:", error));
  }

   ///metoda kojom kupim detalje o poslednjoj poruci iz ceta kako bih prikazala vrijeme kad je poslata 
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


  ///dodavanje clana u grupu 
  function addMember(){
    fetch(`http://localhost:8080/api/mess/addMember?username=${friend}&groupId=${selectedGroup.id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setMemberAdding(false);
      setFriend('');
      return response.json();
    })
  
  
    .catch((error) => console.error("Error adding new member to group:", error));

  }

  //otvori prozor za dodavanje clana
  function openMemberAdding(){
    setMemberAdding(true);
  }
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

///konekcija sa grupnim cetom
  useEffect(() => {
    if (!stompClient || !stompClient.connected || groups.length === 0) {
      return;
    }
  
    console.log("Subscribing to group chats...");
  

    const groupSubscriptions = groups.map((group) => {
      console.log(` Subscribing to group: /topic/group/${group.id}`);
      return stompClient.subscribe(`/topic/group/${group.id}`, (message) => {
        console.log(`Received group message in ${group.id}:`, message.body);
  
        const receivedMessage = JSON.parse(message.body);
  
        setChatMessages((prev) => {
          const existingMessages = prev[group.id] || [];
          return {
            ...prev,
            [group.id]: [...existingMessages, receivedMessage], // ✅ Append to correct group
          };
        });
  
        setChatDetails((prevDetails) => ({
          ...prevDetails,
          [group.id]: { ...prevDetails[group.id], read: false },
        }));
      });
    });
  
    return () => {
      console.log("Unsubscribing from group chats...");
      groupSubscriptions.forEach((sub) => sub.unsubscribe());
    };
  }, [stompClient, groups]); 

   ///metoda kojom otvaram izabrani cet
  function OpenChat(chat){
    setSelectedMssg('');
    setChatOpen(true);
    setChatSelected(chat);
    poopulateChat();
    setSelectedFriend(chat);
    setGroupChatMess(false);
    setSelectedGroup('');
    markRead();
    console.log("Opening chat with:", chat); // Debugging
    console.log("chatMessages:", chatMessages);
  console.log("chatSelected:", chatSelected);
  console.log("chatMessages[chatSelected]:", chatMessages[chatSelected]);
  console.log("chatDetails[chat]:", chatDetails[chatSelected]); 
  }

  
  function OpenGroupChat(group){
    setSelectedMssg('');
    setChatOpen(true);
   // poopulateChat();
  //  setSelectedFriend(chat);
//    markRead();
    populateGroupChat(group);
    setGroupChatMess(true);
    setSelectedGroup(group);
    console.log("Opening chat with:", group.groupName); // Debugging
    
  }
///metoda kojom saljem poruku na privatni cet
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
      console.error("Error sending message:", error);
      setMessageStatus("Error sending message...");
    }
  };
////metoda kojom saljem poruku na grupni cet
  const sendGroupMessage = () => {

    if (!stompClient || !stompClient.connected) {
      console.error("WebSocket is not connected.");
     
      return;
    }

    if (!selectedGroup || !selectedMssg) {
      alert("Please select a friend and write a message.");
      return;
    }

    const message = {
      senderUsername: user.username,
      receiverUsername: selectedGroup.id,
      content: selectedMssg,
      time: new Date().toISOString().slice(0, 19),
    };

    console.log("Sending message:", message);
    
    setMessageStatus("Sending...");

    try {
      stompClient.publish({
        destination: `/socket-subscriber/group/${selectedGroup.id}`, 
        body: JSON.stringify(message),
        
      });
    } catch (error) {
      console.error(" Error sending message:", error);
      setMessageStatus("Error sending message...");
    }
  };

  //metoda kojom formatiram datum i vrijeme za prikaz
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
  
  //metoda kojom se vracam na slanje poruke van ceta
  function newMssg(){
    setChatSelected('');
    setChatOpen(false);
  }

  //metode sa flegovima za otvaranje grupnih ili privatnih cetova
  function OpenGroupChats(){
    setPrivateChats(false);
  }
  function OpenPrivateChats(){
    setPrivateChats(true);
  }

return (
  <div className={styles.whole}>
  <div  className={styles.inb}> 
   {flagGroupChat &&  ( <div className={styles.createGroup} >
      <p>Add friends: <select 
  id="friend-select" 
  multiple   
  value={groupMembers} 
  onChange={(e) => {
   const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setGroupMembers((prevMembers) => {
      const updated = new Set(prevMembers);

      selectedOptions.forEach(option => {
        if (updated.has(option)) {
          updated.delete(option); 
        } else {
          updated.add(option); 
        }
      });
      return Array.from(updated);
    });
  }} 
  className={styles.friendSelect} 
> 
  {friends.map((friend, index) => ( 
    <option key={index} value={friend}>{friend}</option> 
  ))} 
</select>
<span className={styles.selectedFriends}>
  {groupMembers.length > 0 ? (
    <span>Selected: {groupMembers.join(', ')}</span>
  ) : (
    <span>No friends selected</span>
  )}
</span>
</p>
      <p>Group name: <input type="text" placeholder='Write name' onChange={(e)=> setSelectedGroupName(e.target.value)}></input></p>
<button onClick={makeGroup}>Make</button>
    </div>
)}
    <div className={styles.buttonss}>
      <button  className={styles.b} onClick={OpenPrivateChats}>Private Chats</button>
      <button  className={styles.b} onClick={OpenGroupChats}>Group Chats</button>

    </div>
    <button className={styles.bu}  onClick={setGroupChatOpen} ><img src={newGroup}></img></button>
    <button className={styles.bu} onClick={newMssg}><img src={newMess}></img></button>
    { privateChats && (<div>{chats.map((chat) => (
      <div  key={chat}    className={`${styles.mmessage}  ${chatDetails[chat]?.read ? styles.read : styles.unread}`} onClick={() => OpenChat(chat)}>
      
        <img src={im} className={styles.prof}></img>
        {chat}
        <span className={styles.dat}>{formatDateTime(chatDetails[chat]?.dateTime)}</span>
        { !chatDetails[chat]?.read && (
        < img src={neww} className={styles.neww}></img>
        )}
      </div>
    ))}
    </div>)}
    { !privateChats && (<div>{groups.map((group) => (
      <div  key={group.id}    className={styles.mmessage} onClick={() => OpenGroupChat(group)} >
      
        <img src={groupimg} className={styles.prof}></img>
        {group.groupName}
      </div>
    ))}
    </div>)}
  </div>
{chatOpen && (
  <div className={styles.second}>
    { !selectedGroup  && (<span className={styles.chatWindow1}> Chat with {chatSelected}</span>) }
    { !selectedGroup && (
    <div className={styles.chatWindow}>
     
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

    </div> )}
    { selectedGroup && ( <span className={styles.chatWindow1}>Chat with {selectedGroup.groupName} <button onClick={openMemberAdding}>add</button></span> )}
    {memberAdding && <div> <select
            id="friend-select"
            value={friend}
            onChange={(e) => setFriend(e.target.value)}
            className={styles.friendSelect}
          >
            <option value="">Select a friend</option>
            {friends
        .filter(friend => 
          !selectedGroup.members.some(member => member.memberUsername === friend)
        )
        .map((friend, index) => (
          <option key={index} value={friend}>{friend}</option>
        ))}
          </select> <button onClick={addMember}>Add</button></div>}
    { selectedGroup && (
    <div className={styles.chatWindow}>
      
      {(chatMessages[selectedGroup.id] || []).map((msg, index) => (
      <div
        key={index}
        className={msg.senderUsername === username ? styles.sentMessage : styles.receivedMessage}
      >
        <p><strong>{msg.senderUsername}:</strong> {msg.content}</p>
        <span>{new Date(msg.time).toLocaleTimeString()}</span>
      </div>
    ))}

    </div> )}
    <div> { selectedGroup &&(<div className={styles.inputmess}> <input type="text" placeholder="Write your message..." onChange={(e) => setSelectedMssg(e.target.value)}></input>  <button onClick={sendGroupMessage} > <img src={send}></img></button></div> )} { !selectedGroup &&(<div className={styles.inputmess}> <input type="text" placeholder="Write your message..." onChange={(e) => setSelectedMssg(e.target.value)}></input>  <button onClick={sendMessage} > <img src={send}></img></button></div> )}</div>
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
