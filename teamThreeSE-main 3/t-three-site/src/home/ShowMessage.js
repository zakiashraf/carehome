import React, { useState, useEffect } from 'react';
import './ShowMessage.css';
import urlStart from '../Global';

function UserMessage(props) {
  // Get messageIn from props, I also want to get in 
  const { messageIn, userId } = props;

  
  const [message, setMessage] = useState(messageIn || "");
  
  // Update state when prop changes
  useEffect(() => {
    if (messageIn !== undefined) {
      setMessage(messageIn);
    }
  }, [messageIn]);

  function handleAcknowledge() {
    console.log('handleAcknowledge');
    apiAcknowledgeMessage();
    setMessage("");
  }


  async function apiAcknowledgeMessage() {
    console.log('apiAcknowledgeMessage');
    console.log(userId);
    try {
      const response = await fetch(urlStart + 'api/updateMessage', {
        method: 'POST',
        headers: {
          "Authorization": "Bearer " + process.env.REACT_APP_AUTH_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId, message: "" }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('data:', data);
    } catch (error) {
      console.error('Failed to acknowledge message:', error);
    }
  }

  
  return (
    <div className={`moduleBase ${message ? "message-alert" : ""}`}>
      {message ? (
        <div>
          <p>New Message:</p>
          <p className="message-content">{message}</p>
          <button className='btn' onClick={handleAcknowledge}>Acknowledge</button>
        </div>
      ) : (
        <p className="message-content">No new message</p>
      )}
    </div>
  );  
}

export default UserMessage;