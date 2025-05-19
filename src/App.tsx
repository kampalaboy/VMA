import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { MdSend, MdRefresh } from "react-icons/md";
//import VoiceButton from "./functions/voicebutton";
// import SpeechToText from "./functions/stt";
// import { FaMicrophone } from "react-icons/fa";
//import VoiceButton from "./functions/voicebutton";

const App: React.FC = () => {
  interface Message {
    role: string;
    content: string;
    audioUrl?: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);

  const [userInput, setUserInput] = useState<string>("");

  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [responser, setResponser] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const params = window.location.search;
  const urlParams = new URLSearchParams(params);
  const pname = urlParams.get("name") || "";
  const plang = urlParams.get("lang");

  const pid = urlParams.get("id") || "";

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
    await startInteract(userInput, userMessage, selectedEndpoint, responser);
  };

  const startInteract = async (
    userInput: string,
    userMessage: { role: string; content: string },
    endpoint: string,
    responser: string
  ) => {
    console.log(messages);
    const optionsText: RequestInit = {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "RAG-APP-API-Key": "Quick2go!",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        question: userInput,
        // convo: messages.map((msg) => ({
        //   role: msg.role,
        //   content: msg.content,
        // })),
        dbtype: "MYSQL",
        ragllm_instructions: `[<|system|>\nYou are LifeHealth ChatBot. You are a cautious assistant. 
                  You carefully follow instructions. You are helpful and harmless and you follow ethical guidelines and promote positive behavior. If {query_str} is a greeting respond appropriately. Information will be provided to help answer the user's questions.  If you do not find the answer reply to the question appropriately.Also information will be provided on how to handle various support chain tasks i.e. troubleshooting, replying to reviews, answering FAQs. Please do not waste the response on any words other than the response. You look through the documents provided and find the appropriate response to {query_str}.
                  If the response makes sense as a list of steps number the steps accordingly using a \n to print the steps and answer only using the list of numbered steps like: 1.\n 2.\n 3.\nOtherwise, one sentence answers do not need the numbered steps just provide the response. Respond to {query_str} in the same language as {query_str} Take the same response in the documents and translate to the {query_str} language. <|user|>\n{context_str}\n\n{query_str}\n<|assistant|>`,
        es_index_name: "health-docs-index",
        user_id: pid,
        es_index_text_field: "body_content_field",
        es_model_name: ".elser_model_2",
        es_model_text_field: "ml.tokens",
        num_results: "1",
        sqlllm_params: {
          model_id: "meta-llama/llama-3-405b-instruct",
          inputs: [],
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 300,
            min_new_tokens: 1,
            moderations: {
              hap_input: "true",
              hap_output: "true",
              threshold: 0.75,
            },
            repetition_penalty: 1.1,
            temperature: 0.7,
            top_k: 50,
            top_p: 1,
          },
        },
        classifyllm_params: {
          model_id: "meta-llama/llama-3-405b-instruct",
          inputs: [],
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 100,
            min_new_tokens: 1,
            moderations: {
              hap_input: "true",
              hap_output: "true",
              threshold: 0.75,
            },
            repetition_penalty: 1.1,
            temperature: 0.7,
            top_k: 50,
            top_p: 1,
          },
        },
        ragllm_params: {
          model_id: "meta-llama/llama-3-405b-instruct",
          inputs: [],
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 100,
            min_new_tokens: 1,
            moderations: {
              hap_input: "true",
              hap_output: "true",
              threshold: 0.75,
            },
            repetition_penalty: 1.1,
            temperature: 0.7,
            top_k: 50,
            top_p: 1,
          },
        },
        generalllm_params: {
          model_id: "meta-llama/llama-3-405b-instruct",
          inputs: [],
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 100,
            min_new_tokens: 1,
            moderations: {
              hap_input: "true",
              hap_output: "true",
              threshold: 0.75,
            },
            repetition_penalty: 1.1,
            temperature: 0.7,
            top_k: 50,
            top_p: 1,
          },
        },
      }),
    };

    if (userInput) {
      setLoading(true);
      try {
        const res = await fetch(
          //`https://cti-app.1r1lw5ypdyix.us-east.codeengine.appdomain.cloud/${endpoint}`,
          `http://localhost:4050/${endpoint}`,
          optionsText
        );
        console.log(res);
        const data = await res.json();

        setLoading(false);
        console.log(data);

        let answer: string;
        if (data.response == "") {
          const plang = urlParams.get("lang");
          const replies = {
            en: "Sorry, I could not find what you were looking for.",
            fr: "Désolé, je n'ai pas trsouvé ce que vous cherchiez.",
            es: "Lo siento, no pude encontrar lo que buscabas.",
            pt: "Desculpe, não consegui encontrar o que procurava",
            lg: "Bambi, Ssisobodde kufuna ekyo kyo'nonya.",
            nyn: "Ihangane, ongera ubivuge.",
            sw: "Samahani, siwezi kupata ulichokuwa unatafuta.",
          };

          answer = replies[plang as keyof typeof replies] || replies.en;
          if (endpoint == "stt") {
            const data = await res.json();
            const transcript = data.transcript;
            setMessages([
              ...messages,
              userMessage,
              { role: "user", content: transcript.trim() },
            ]);
          }
        } else {
          answer = data[responser];
          console.log(answer);
        }
        setMessages([
          ...messages,
          userMessage,
          { role: "bot", content: answer.trim() },
        ]);
      } catch (error) {
        setMessages([
          ...messages,
          userMessage,
          { role: "bot", content: "Something went wrong." },
        ]);
        console.error(error);
        setLoading(false);
      }
    }
  };

  const latestMessage = useRef<HTMLDivElement>(null);
  const loaders = [
    { id: 1, imgSrc: "assets/loaders/heartythink.gif" },
    { id: 2, imgSrc: "assets/loaders/heartyread.gif" },
    { id: 3, imgSrc: "assets/loaders/heartynotes.gif" },
    { id: 4, imgSrc: "assets/loaders/heartysearch.gif" },
    { id: 5, imgSrc: "assets/loaders/heartycompare.gif" },
    { id: 6, imgSrc: "assets/loaders/heartywave.gif" },
  ];

  function getRandomLoader() {
    const randomIndex = Math.floor(Math.random() * loaders.length);
    return loaders[randomIndex].imgSrc;
  }
  useEffect(() => {
    if (latestMessage.current) {
      latestMessage.current.scrollIntoView();
    }
  }, [messages]);

  return (
    <div className="border-black w-screen flex flex-col h-[100vh] z-10 ">
      {/* Header*/}
      <div className="h-16 px-4 py-3 flex justify-between items-center bg-blue-600 w-full z-10">
        <div className="w-1/3"></div>
        <div className="w-1/3 flex justify-center">
          <span className="font-bold">VIMA</span>
        </div>
        <div className="w-1/3 flex justify-end">
          <div
            onClick={() => window.location.reload()}
            className="bg-transparent py-1 px-4 rounded-md hover:cursor-pointer"
          >
            <MdRefresh
              size={23}
              className="transition-transform active:animate-[spin_1s_ease-in-out]"
            />
          </div>
        </div>
      </div>

      {/* Messages Container*/}
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
              <audio controls className="mb-2 max-w-full">
                <source src={message.audioUrl} type="audio/wav" />
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

      <div className="bg-white overflow-hidden pt-1 border-none">
        <p className="text-gray-500 text-[9px] lg:text-[10px] flex justify-center">
          AI-generated content may be inaccurate or misleading. Always check for
          accuracy.
        </p>
      </div>
      {/* Send Messages*/}
      <div className="bg-rose-600 h-20 px-4 flex flex-grow items-center relative">
        <div className="flex w-full">
          <form
            onSubmit={handleSubmit}
            className="flex w-full  gap-x-2 space-x-1"
          >
            <div className="bg-white dark:bg-neutral-700 rounded-[20px] relative w-full">
              <div className="overflow-hidden">
                <textarea
                  id="inputBot"
                  placeholder="Type a message"
                  className="bg-white dark:bg-neutral-700 text-sm focus:outline-none rounded-[20px] w-[85%] h-[50px] py-4 pl-6 leading-3 outline-none disabled:opacity-0 overflow-y-auto touch-pan-y " // Increased right padding (pr-12)
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  style={{
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "contain",
                    paddingRight: "calc(2rem + 12px)",
                  }}
                />
              </div>
              <div className="absolute top-1/2 right-1 transform -translate-y-1/2">
                {" "}
                {/* Position the button container */}
                {/* {userInput ? (
                  <button
                    id="query"
                    className="bg-transparent p-1 rounded-full"
                    type="submit"
                    onClick={() => {
                      setSelectedEndpoint("watsonchat");
                      setResponser("response");
                    }}
                  >
                    <MdSend className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl" />
                  </button>
                ) : (
                  <VoiceButton setMessages={setMessages} messages={messages} />
                )} */}
                <button
                  id="query"
                  className="bg-transparent p-1 rounded-full"
                  type="submit"
                  onClick={() => {
                    setSelectedEndpoint("watsonchat");
                    setResponser("response");
                  }}
                >
                  <MdSend className="text-gray-400 hover:text-gray-600 cursor-pointer text-xl" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
