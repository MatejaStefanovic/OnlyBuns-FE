import React from 'react';
import styles from './inbox.module.css';
import im  from '../../assets/images/nature.jpg'; 
import neww  from '../../assets/icons/circle.png'; 
function InboxPage() {
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
    New chat 
  </div>
  </div>
);
}

export default InboxPage;
