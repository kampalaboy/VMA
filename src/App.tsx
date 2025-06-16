import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { MdSend } from "react-icons/md";

import { startInteract } from "./functions/AI/watsonAPI";
import VoiceButton from "./functions/vb2";

import getRandomLoader from "./utils/loadAnimate";

import Header from "./components/header";
import Messages from "./components/messages";

import { Message } from "./types/message";
// import SpeechToText from "./functions/stt";
// import { FaMicrophone } from "react-icons/fa";
//import VoiceButton from "./functions/voicebutton";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const [userInput, setUserInput] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  //const [user, setUser] = useState<string>("");
  const [lang, setLang] = useState<string>("");

  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [responser, setResponser] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const params = window.location.search;
  const urlParams = new URLSearchParams(params);
  const pname = urlParams.get("name") || "";
  const plang = urlParams.get("lang") || "";

  const pid = urlParams.get("id") || "";

  useEffect(() => {
    //setUser(pname);
    setUserId(pid);
    setLang(plang);
  }, [pname, pid, plang]);

  useEffect(() => {
    const welcomeMessages = {
      en: `Hello, ${pname}. I'm VIMA. How can I help?
      `,
      fr: `Bonjour, ${pname}. Je suis VIMA. Comment puis-je vous aider?
      `,
      es: `Hola, ${pname}. Soy VIMA. ¿Cómo puedo ayudarte?
      `,
      pt: `Olá, ${pname}. Eu sou VIMA. Como posso ajudar?
      `,
      lg: `Oli otya, ${pname}. Nze VIMA. Nnyamba ntya?
      `,
      nyn: `Oraire ${pname}. Ndi VIMA. Ninkukoonyera nta?
      `,
      sw: `Hujambo, ${pname}. Mimi ni VIMA. Nawezaje kusaidia?
      `,
      am: `ሰላም, ${pname}. እኔ VIMA ነኝ። እንዴት ልረዳዎት?
      `,
      hi: `नमस्ते, ${pname}। मैं VIMA हूं। मैं कैसे मदद कर सकता हूं?
      `,
      ar: `مرحباً ${pname}. أنا VIMA. كيف يمكنني المساعدة؟
      `,
    };
    setMessages([
      {
        role: "bot",
        content:
          welcomeMessages[plang as keyof typeof welcomeMessages] ||
          `Hello I'm VIMA. How can I help you?`,
      },
    ]);
  }, [plang, pname]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userInput.trim()) return;
    const userMessage = { role: "user", content: userInput };
    console.log(userInput);
    setMessages([...messages, userMessage]);
    setUserInput("");
    await startInteract(
      setMessages,
      setLoading,
      messages,
      userInput,
      userId,
      lang,
      userMessage,
      selectedEndpoint,
      responser
    );
  };

  const latestMessage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (latestMessage.current) {
      latestMessage.current.scrollIntoView();
    }
  }, [messages]);

  return (
    <div className="border-black w-screen flex flex-col h-[100vh] z-10 ">
      {/* Header*/}

      <Header />
      {/* Messages Container*/}

      <Messages
        messages={messages}
        getRandomLoader={getRandomLoader}
        loading={loading}
        latestMessage={latestMessage}
      />

      <div className="bg-white overflow-hidden pt-1 border-none">
        <p className="text-gray-500 text-[9px] lg:text-[10px] flex justify-center">
          AI-generated content may be inaccurate or misleading. Always check for
          accuracy.
        </p>
      </div>
      {/* Send Messages*/}
      <div className="bg-rose-600 h-20 px-4 flex flex-grow items-center relative">
        <form
          onSubmit={handleSubmit}
          className="flex w-full  gap-x-2 space-x-1"
        >
          <div className=" relative w-full">
            <textarea
              id="inputBot"
              //type="text"
              placeholder="Type a message"
              className="bg-white dark:bg-neutral-700 text-sm rounded-[20px] w-full min-h-[20px] max-h-[50px] py-4 px-6 pr-6 overflow-y-hidden touch-pan-y whitespace-pre-wrap break-words"
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
              }}
            />
          </div>
          <div className="relative">
            {" "}
            {/* Position the button container */}
            {userInput ? (
              <button
                id="query"
                className="bg-transparent p-1 my-3 rounded-full"
                type="submit"
                onClick={() => {
                  setSelectedEndpoint("watsonchat");
                  setResponser("response");
                }}
              >
                <MdSend className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl" />
              </button>
            ) : (
              <VoiceButton
                setMessages={setMessages}
                messages={messages}
                setLoading={setLoading}
                userId={userId}
                lang={lang}
                endpoint={"STT"}
                responser="transcript"
              />
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default App;
