import React from "react";
import { Message } from "../types/message";

interface MessagesProps {
  messages: Message[];
  getRandomLoader: () => string;
  loading: boolean;
  latestMessage: React.RefObject<HTMLDivElement>;
}
const Messages: React.FC<MessagesProps> = ({
  messages,
  getRandomLoader,
  loading,
  latestMessage,
}) => {
  return (
    <div
      id="message-container"
      className=" bg-amber-50 h-[80vh] w-full relative flex-grow overflow-auto scroll"
    >
      {messages.map((message, index) => (
        <div
          key={index}
          className={`${
            message.role === "bot"
              ? "bg-green-400 text-black rounded-lg mb-[10px] m-3 p-[10px] w-fit lg:max-w-[50%] md:max-w-[70%] max-w-[90%] mr-10"
              : "bg-teal-600 text-black rounded-lg mb-[10px] p-[10px] break-words w-fit max-w-[90%] lg:ml-auto lg:mr-1 md:ml-auto md:mr-1 ml-auto mr-3"
          }`}
          style={{
            wordBreak: "break-word",
          }}
        >
          {message.audioUrl && (
            <audio
              controls
              controlsList="nodownload"
              preload="metadata"
              className="mb-2 max-w-full"
            >
              <source src={message.audioUrl} />
              Your browser does not support the audio element.
            </audio>
          )}
          {message.content.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < message.content.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
      ))}

      {loading && (
        <img
          src={getRandomLoader()}
          id="loading"
          className="w-[100px] h-[100px] ml-10"
        />
      )}
      <div ref={latestMessage}></div>
    </div>
  );
};

export default Messages;
