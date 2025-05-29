import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import io from 'socket.io-client';
import useSound from 'use-sound';
import config from '../../../config';
import LatestMessagesContext from '../../../contexts/LatestMessages/LatestMessages';
import TypingMessage from './TypingMessage';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import '../styles/_messages.scss';

const socket = io(
  config.BOT_SERVER_ENDPOINT,
  { transports: ['websocket', 'polling', 'flashsocket'] }
);

const ME = 'me';
const BOT = 'bot';

function Messages() {
  const [playSend] = useSound(config.SEND_AUDIO_URL);
  const [playReceive] = useSound(config.RECEIVE_AUDIO_URL);
  const { setLatestMessage } = useContext(LatestMessagesContext);

  const [messages, setMessages] = useState([
    { id: 1, user: BOT, message: "Hi! My name's Botty." }
  ]);
  const [message, setMessage] = useState('');
  const [botTyping, setBotTyping] = useState(false);

  const messageListRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages or typing state changes
  useEffect(() => {
    const el = document.getElementById('message-list');
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, botTyping]);

  // Socket event listeners for bot typing and messages
  useEffect(() => {
    socket.on('bot-typing', () => setBotTyping(true));
    socket.on('bot-message', (payload) => {
      setBotTyping(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now(), user: BOT, message: payload }
      ]);
      setLatestMessage(BOT, payload);
      playReceive();
    });
    // Cleanup listeners on unmount
    return () => {
      socket.off('bot-typing');
      socket.off('bot-message');
    };
  }, [setLatestMessage, playReceive]);

  // Send message to bot
  const sendMessage = useCallback(() => {
    if (!message.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now(), user: ME, message }
    ]);
    setLatestMessage(ME, message);
    playSend();
    socket.emit('user-message', message);
    setMessage('');
    if (inputRef.current) inputRef.current.focus();
  }, [message, setLatestMessage, playSend]);

  // Handle input change
  const onChangeMessage = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

  return (
    <div className="messages">
      <Header />
      <div className="messages__list" id="message-list" ref={messageListRef}>
        {messages.map((msg, idx) => (
          <Message
            key={msg.id}
            message={msg}
            nextMessage={messages[idx + 1]}
            botTyping={botTyping}
          />
        ))}
        {botTyping && <TypingMessage />}
      </div>
      <Footer message={message} sendMessage={sendMessage} onChangeMessage={onChangeMessage} inputRef={inputRef} />
    </div>
  );
}

export default Messages;
