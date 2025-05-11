import React from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import useSTT from "./stt";

interface VoiceButtonProps {
  setUserInput: (text: string) => void;
}

const VoiceButton = () => {
  const { isRecording, startSTT, stopSTT, transcript } = useSTT();
  console.log(transcript);

  //setUserInput(transcript);

  return (
    <>
      <button
        id="voice"
        className="rounded-full p-1 bg-transparent"
        type="button"
      >
        {isRecording ? (
          <FaStop color="red" className="text-xl" onClick={stopSTT} />
        ) : (
          <FaMicrophone
            color="black"
            className="text-gray-400 text-xl"
            onClick={startSTT}
          />
        )}
      </button>
    </>
  );
};

export default VoiceButton;
