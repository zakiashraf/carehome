import React, { useState, useEffect } from "react";
import "./WeatherModule.css";
import urlStart from "../Global";
import "./GiveMessage.css";

function GiveMessage(props) {
  // Get messageIn from props, I also want to get in
  const { userId } = props;

  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  // Update state when prop changes

  async function apiAcknowledgeMessage() {

    setMessageSent(true);
    console.log("apiAcknowledgeMessage");
    console.log(userId);
    try {
      const response = await fetch(urlStart + "api/updateMessage", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.REACT_APP_AUTH_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId, message: message }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("data:", data);
    } catch (error) {
      console.error("Failed to acknowledge message:", error);
    }

  }

  return (
    <div className="widerBase">
      {!messageSent ? (
        <div>
          <p>Send a new message:</p>
          <input
            type="text"
            id="messageInput"
            placeholder="Enter your message"
            style={{ width: "90%" }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {message.length > 3 && (
            <button 
              className="btn" 
              style={{ marginTop: "10px" }}
              onClick={apiAcknowledgeMessage}
            >
              Send
            </button>
          )}
        </div>
      ) : (
        <p>Message Sent!</p>
      )}
    </div>
  );
}
export default GiveMessage;
