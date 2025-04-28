import React from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { useSpeechToText } from "./stt"; // Import the hook

interface VoiceButtonProps {
  setUserInput: (text: string) => void;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ setUserInput }) => {
  const { transcript, isRecording, startRecording, stopRecording } =
    useSpeechToText();
  console.log(transcript);

  setUserInput(transcript);

  return (
    <>
      <button
        id="voice"
        className="rounded-full p-1 bg-transparent"
        type="button"
      >
        {isRecording ? (
          <FaStop color="red" className="text-xl" onClick={stopRecording} />
        ) : (
          <FaMicrophone
            color="black"
            className="text-gray-400 text-xl"
            onClick={startRecording}
          />
        )}
      </button>
    </>
  );
};

export default VoiceButton;
