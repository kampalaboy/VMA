import React from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import useSTT from "./stt";

interface VoiceButtonProps {
  setMessages: React.Dispatch<
    React.SetStateAction<{ role: string; content: string }[]>
  >;
  messages: { role: string; content: string }[];
  // startInteract: (
  //   userInput: string,
  //   userMessage: { role: string; content: string },
  //   endpoint: string,
  //   responser: string
  // ) => Promise<void>;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ setMessages, messages }) => {
  const { isRecording, startSTT, stopSTT } = useSTT();

  const handleVoiceStop = async () => {
    if (isRecording) {
      try {
        const audioUrl = await stopSTT();
        if (audioUrl) {
          const userMessage = {
            role: "user",
            content:
              "Voice message sent at: " + new Date().toLocaleTimeString(),
            audioUrl: audioUrl,
          };
          setMessages([...messages, userMessage]);
        }
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
    }
  };

  return (
    <button
      type="button"
      className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-transparent rounded-full z-20"
      onClick={isRecording ? handleVoiceStop : startSTT}
      onTouchEnd={(e) => {
        e.preventDefault();
        isRecording ? handleVoiceStop() : startSTT();
      }}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording ? (
        <FaStop color="red" className="text-xl" />
      ) : (
        <FaMicrophone color="black" className="text-gray-400 text-xl" />
      )}
    </button>
  );
};

export default VoiceButton;
