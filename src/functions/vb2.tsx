// Updated VoiceButton - simplified to match the flow
import React from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import useSTT from "./AI/stt";
import { Message } from "../types/message";
//import { startInteract } from "./AI/agnosticVoiceAPI";
import { startVoiceInteract } from "./AI/watsonVoiceAPI";

interface VoiceButtonProps {
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  messages: Message[];
  userId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  lang: string;
  endpoint: string;
  responser: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  setMessages,
  messages,
  userId,
  setLoading,
  lang,
  endpoint,
}) => {
  const { isRecording, startSTT, stopSTT } = useSTT();

  const handleVoiceStop = async () => {
    if (isRecording) {
      try {
        const { audioData, audioUrl } = await stopSTT();
        console.log(audioData);
        if (audioUrl && audioData) {
          const userMessage = {
            role: "user",
            content: "🎤 You at " + new Date().toLocaleTimeString(),
            audioUrl: audioUrl,
          };
          setMessages([...messages, userMessage]);

          // Send the recording to webhook
          await startVoiceInteract(
            setMessages,
            setLoading,
            userMessage,
            messages,
            userId,
            audioData,
            audioUrl,
            lang,
            endpoint
          );
        }
      } catch (error) {
        console.error("Failed to process recording:", error);
      }
    }
  };

  return (
    <button
      type="button"
      className="relative bg-transparent p-1 my-3 rounded-full z-20"
      onClick={isRecording ? handleVoiceStop : startSTT}
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
