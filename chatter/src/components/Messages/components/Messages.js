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

function Messages({ contactPanelMinimised }) {
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

  // Update sendMessage to accept a message argument
  const sendMessage = useCallback((msgToSend) => {
    if (!msgToSend.trim()) return;
    setMessages(prev => [
      ...prev,
      { id: Date.now(), user: ME, message: msgToSend }
    ]);
    setLatestMessage(ME, msgToSend);
    playSend();
    socket.emit('user-message', msgToSend);
    setMessage('');
    if (inputRef.current) inputRef.current.focus();
  }, [setLatestMessage, playSend]);

  // Handle input change
  const onChangeMessage = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

  function renderMessageContent(msg) {
    const attachmentMatch = msg.message.match(/\[Attachment: ([^\]]+)\]/);
    if (attachmentMatch) {
      const filename = attachmentMatch[1];
      const text = msg.message.replace(/\s*\[Attachment: [^\]]+\]/, '');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0' }}>
          <a
            href={`/uploads/${filename}`}
            download={filename}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#3898EB',
              textDecoration: 'none'
            }}
            target="_blank"
            rel="noopener noreferrer"
          >
            <i
              className="fas fa-file-archive"
              style={{
                fontSize: 48,
                color: '#f4b400',
                marginBottom: 4,
                display: 'block',
                textAlign: 'center'
              }}
            />
            <span style={{ fontWeight: 500, fontSize: 16, textAlign: 'center', marginTop: 4 }}>
              {filename}
            </span>
          </a>
          {text && (
            <div style={{ marginTop: 8, textAlign: 'center', color: '#333' }}>
              {text}
            </div>
          )}
        </div>
      );
    }
    return msg.message;
  }

  return (
    <div className={`messages${contactPanelMinimised ? ' messages--expanded' : ''}`}>
      <Header />
      <div className="messages__list" id="message-list" ref={messageListRef}>
        {messages.map((msg, idx) => (
          <Message
            key={msg.id}
            message={{ ...msg, message: renderMessageContent(msg) }}
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
