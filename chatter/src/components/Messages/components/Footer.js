import React, { useState, useRef } from 'react';

const RETURN_KEY_CODE = 13;
const EMOJIS = ['😀', '😂', '😍', '👍', '🎉', '😎', '😢', '😡', '🙏', '🔥'];

export default function Footer({ sendMessage, onChangeMessage, message, inputRef }) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef();
  const smileyIconRef = useRef();
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const fileInputRef = useRef();

  const onKeyDown = ({ keyCode }) => {
    if (keyCode !== RETURN_KEY_CODE ) { return; }
    handleSend();
  };

  // Insert emoji at cursor position
  const handleEmojiClick = (emoji) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const newValue = message.slice(0, start) + emoji + message.slice(end);
      onChangeMessage({ target: { value: newValue } });
      setShowEmojiPicker(false);
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
  };

  // Hide emoji picker when clicking outside
  React.useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        smileyIconRef.current &&
        !smileyIconRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const [pickerStyle, setPickerStyle] = useState({});
  const handleShowEmojiPicker = () => {
    if (smileyIconRef.current) {
      const rect = smileyIconRef.current.getBoundingClientRect();
      setPickerStyle({
        position: 'fixed',
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY - 150, 
        background: '#fff',
        border: '1px solid #eee',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '8px',
        zIndex: 1000,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        width: '180px'
      });
    }
    setShowEmojiPicker((v) => !v);
  };

  // Handle file selection
  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // reset so same file can be picked again
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setPendingAttachment(file);
      // Optionally, you can show the filename in the input or as a preview
      // onChangeMessage({ target: { value: message } });
    }
  };

  // Custom send handler to include attachment if present
  const handleSend = () => {
    let newMessage = message;
    if (pendingAttachment) {
      newMessage = message + ` [Attachment: ${pendingAttachment.name}]`;
    }
    if (!newMessage.trim() && !pendingAttachment) return;
    sendMessage(newMessage);
    if (pendingAttachment) {
      window.dispatchEvent(new CustomEvent('new-attachment', { detail: { filename: pendingAttachment.name } }));
      setPendingAttachment(null);
    }
    // Clear input after send
    onChangeMessage({ target: { value: '' } });
  };

  return (
    <div className="messages__footer">
      <input
        ref={inputRef}
        onKeyDown={onKeyDown}
        placeholder="Write a message..."
        id="user-message-input"
        onChange={onChangeMessage}
        value={message}
      />
      <div className="messages__footer__actions">
        <i
          className="far fa-smile"
          style={{ cursor: 'pointer' }}
          ref={smileyIconRef}
          onClick={handleShowEmojiPicker}
        />
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            style={pickerStyle}
          >
            {EMOJIS.map((emoji) => (
              <span
                key={emoji}
                style={{ fontSize: '22px', cursor: 'pointer' }}
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </span>
            ))}
          </div>
        )}
        <i
          className="fas fa-paperclip"
          style={{ cursor: 'pointer' }}
          onClick={handleAttachmentClick}
        />
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <i className="mdi mdi-ticket-outline" />
        <button onClick={handleSend} disabled={!message && !pendingAttachment}>Send</button>
        {/* Optionally show pending attachment name */}
        {pendingAttachment && (
          <span style={{ marginLeft: 8, fontSize: 12, color: '#888' }}>
            {pendingAttachment.name}
          </span>
        )}
      </div>
    </div>
  );
}
