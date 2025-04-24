// App.jsx
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('https://chatapp-he92.onrender.com');

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [userName, setUserName] = useState('');
  const [isTyping, setIsTyping] = useState(null);

  useEffect(() => {
    const name = prompt('Enter your name:');
    setUserName(name || 'Unknown');
    socket.emit('user_joined', name || 'Unknown');

    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('user_typing', (name) => {
      setIsTyping(`${name} is typing...`);
      setTimeout(() => setIsTyping(null), 3000);
    });

    socket.on('system_message', (data) => {
      setMessages((prev) => [...prev, { type: 'system', text: data }]);
    });

    return () => {
      socket.emit('user_left', name || 'Unknown');
      socket.off('receive_message');
      socket.off('user_typing');
      socket.off('system_message');
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() === '') return;
    const messageData = {
      sender: userName,
      text: input,
      time: new Date().toLocaleTimeString(),
    };
    socket.emit('send_message', messageData);
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    } else {
      socket.emit('user_typing', userName);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">Vinayak Chat App</div>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          msg.type === 'system' ? (
            <div key={index} className="chat-system-message">{msg.text}</div>
          ) : (
            <div
              key={index}
              className={`chat-message ${msg.sender === userName ? 'you-message' : 'friend-message'}`}
            >
              <strong>{msg.sender}:</strong> {msg.text}
              {msg.time && <span className="chat-time"> ({msg.time})</span>}
            </div>
          )
        ))}
        {isTyping && <div className="chat-typing">{isTyping}</div>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          placeholder="Type a message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
