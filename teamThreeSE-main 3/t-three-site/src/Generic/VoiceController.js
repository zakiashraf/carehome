import React, { useEffect, useRef } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import "./VoiceController.css";

const VoiceToText = ({ detailedCommands, styleIn }) => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (transcript) {
      clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(() => {
        resetTranscript();
        handleVoiceCommand(transcript);
      }, 1500);
    }
  }, [transcript, resetTranscript]);

  function handleVoiceCommand(command) {
    var localCommand = command.toLowerCase();

    if (localCommand.includes("log out") || localCommand.includes("logout")) {
      localStorage.removeItem("username");
      localStorage.removeItem("userId");
      window.location.href = "/";
    } else if (localCommand.includes("home")) {
      window.location.href = "/home";
    } else {
      detailedCommands(localCommand);
    }
  }

  const startListening = () => {
    SpeechRecognition.startListening({ continuous: true });
  };

  if (!browserSupportsSpeechRecognition) {
    return <div>Browser doesn't support speech recognition.</div>;
  }

  return (
    <div className="voiceBase">
      <p>Microphone: {listening ? "ON" : "OFF"}</p>
      <div className="controls">
        <button onClick={startListening} disabled={listening}>
          Start Listening
        </button>
        <button onClick={SpeechRecognition.stopListening} disabled={!listening}>
          Stop Listening
        </button>
      </div>
      <div className="transcript">
        <p>{transcript}</p>
      </div>
    </div>
  );
};

export default VoiceToText;
