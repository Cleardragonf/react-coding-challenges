import React, { useState } from 'react';
import cx from 'classnames';
import './_contact-panel.scss';

export default function ContactPanel() {
  const [minimised, setMinimised] = useState(Boolean(localStorage.getItem('minimised')));
  const [attachments, setAttachments] = useState([
    { name: 'Dataset.csv', icon: 'fas fa-paperclip', url: '/uploads/Dataset.csv' },
    { name: 'bot_face.jpg', icon: 'far fa-image', url: '/uploads/bot_face.jpg' }
  ]);
  // Show only 3 attachments unless "View All" is clicked
  const [showAllAttachments, setShowAllAttachments] = useState(false);
  const visibleAttachments = showAllAttachments ? attachments : attachments.slice(0, 3);

  React.useEffect(() => {
    function handleNewAttachment(e) {
      if (e.detail && e.detail.filename) {
        setAttachments(prev => {
          if (prev.some(att => att.name === e.detail.filename)) return prev;
          return [
            ...prev,
            { name: e.detail.filename, icon: 'fas fa-file-archive', url: `/uploads/${e.detail.filename}` }
          ];
        });
      }
    }
    window.addEventListener('new-attachment', handleNewAttachment);
    return () => window.removeEventListener('new-attachment', handleNewAttachment);
  }, []);

  const onClick = () => {
    localStorage.setItem('minimised', minimised ? '' : 'true');
    setMinimised(!minimised);
  };

  return (
    <div className={cx('contact-panel', { 'contact-panel--minimised': minimised })}>
      <div className="contact-panel__header">
        <i className="mdi mdi-exit-to-app contact-panel__toggle" onClick={onClick} />
        <div className="contact-panel__header__profile">
          <div className="contact-panel__header__profile__picture"><i className="fas fa-comment-dots"/></div>
          <h1>Botty</h1>
        </div>
      </div>
      <div className="contact-panel__body">
        <div className="contact-panel__body__block">
          <p className="contact-panel__body__label">Email</p>
          <p className="contact-panel__body__value">botty@reactcodingchallenges.com</p>
        </div>
        <div className="contact-panel__body__block">
          <p className="contact-panel__body__label">Phone</p>
          <p className="contact-panel__body__value">0498365942</p>
        </div>
        <div className="contact-panel__body__block">
          <p className="contact-panel__body__label">Labels</p>
          <div className="contact-panel__body__labels">
            <p>Bot<i className="fas fa-times" /></p>
            <p>React<i className="fas fa-times" /></p>
          </div>
        </div>
        <div className="contact-panel__body__block">
          <p className="contact-panel__body__label">Attachments</p>
          <div className="contact-panel__body__attachments">
            {visibleAttachments.map(att => (
              <p key={att.name}>
                <i className={att.icon} />
                <a
                  href={att.url}
                  download={att.name}
                  style={{ marginLeft: 6, color: '#3898EB', textDecoration: 'underline' }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {att.name}
                </a>
              </p>
            ))}
          </div>
          {attachments.length > 3 && (
            <p
              className="contact-panel__body__link"
              style={{ cursor: 'pointer', userSelect: 'none' }}
              onClick={() => setShowAllAttachments(v => !v)}
            >
              {showAllAttachments
                ? 'Hide'
                : <>View All <span style={{ color: '#3898EB' }}>({attachments.length})</span></>
              }
            </p>
          )}
        </div>
        <button className="contact-panel__body__edit-btn">Edit Contact</button>
      </div>
    </div>
  );
}
