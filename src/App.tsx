import React, { useState, FormEvent, useRef, useEffect } from "react";
import "./App.css";
import { FaMicrophone } from "react-icons/fa";
import { MdSend } from "react-icons/md";

const App: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [userInput, setUserInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [language, setLanguage] = useState("");

  const userLanguage = {
    en: "English",
    fr: "French",
    es: "Spanish",
    lg: "Luganda",
    nyn: "Runyankole",
    sw: "Swahili",
  };

  const params = window.location.search;
  const urlParams = new URLSearchParams(params);

  useEffect(() => {
    const pname = urlParams.get("name") || "";
    const plang = urlParams.get("lang");

    const welcomeMessages = {
      en: `Welcome to Life Health, ${pname}.  How can I assist?`,
      fr: `Bienvenue sur Life Health, ${pname}.  Comment puis-je vous aider ?`,
      es: `Bienvenido a Life Health, ${pname}.  ¿En qué puedo ayudar?`,
      lg: `Mwaniriziddwa mu Life Health, ${pname}.  Nnyinza ntya okuyamba?`,
      nyn: `Murakaza neza kubuzima, ${pname}. Nigute nshobora gufasha?`,
      sw: `Karibu kwenye Life Health, ${pname}.  Naweza kukusaidia vipi?`,
      // Add more languages as needed
    };
    setMessages([
      {
        role: "bot",
        content:
          welcomeMessages[plang as keyof typeof welcomeMessages] ||
          `Welcome to Life Health. How can I assist?`,
      },
    ]);
    setLanguage(plang || "");
  }, []);

  const pid = urlParams.get("id");

  const startInteract = async (
    userInput: string,
    userMessage: { role: string; content: string },
    userLanguage: object,
    pid: string | null
  ) => {
    const optionsText: RequestInit = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "RAG-APP-API-Key": "Quick2go!",
      },
      body: JSON.stringify({
        question: userInput,
        dbtype: "MYSQL",
        ragllm_instructions: `<|system|>\n
                                  You are an AI FAQ assistant for LifeHealth Global.
                                  You are HealthApp Chat, an AI language model developed by IBM. 
                                  You are a cautious assistant. You carefully follow instructions. 
                                  You are helpful and harmless and you follow ethical guidelines and promote positive behavior. 
                                  If you do not find the answer reply to the question appropriately. 
                                  Reply to ${userInput} in the ${userLanguage} that has been prompted. 
                                  <|user|>\n{context_str}\n\n{query_str}\n<|assistant|>
                                `,
        es_index_name: "health-docs-index",
        user_id: pid,
        es_index_text_field: "body_content_field",
        es_model_name: ".elser_model_2",
        es_model_text_field: "ml.tokens",
        num_results: "5",
        sqlllm_params: {
          model_id: "meta-llama/llama-3-70b-instruct",
          inputs: [],
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 500,
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
          model_id: "meta-llama/llama-3-70b-instruct",
          inputs: [],
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 500,
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
          model_id: "meta-llama/llama-3-70b-instruct",
          inputs: [],
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 500,
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
          model_id: "meta-llama/llama-3-70b-instruct",
          inputs: [],
          parameters: {
            decoding_method: "greedy",
            max_new_tokens: 500,
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
      setLoading(true); // Show loader before making the API call
      try {
        const res = await fetch(
          "https://gen-llm-service.1iv6psdwvd0v.us-south.codeengine.appdomain.cloud/watsonchat",
          optionsText
        );
        const data = await res.json();

        setLoading(false);
        console.log(data);
        // Extract the answer from the chunks array
        let answer: string;
        if (data.response == "") {
          const plang = urlParams.get("lang");
          const replies = {
            en: "Sorry, say that again.",
            fr: "Désolé, répétez-le.",
            es: "Lo siento, dilo de nuevo.",
            lg: "Bambi, sikutegede ddamu okwogera ekyo.",
            nyn: "Ihangane, ongera ubivuge.",
            sw: "Samahani, sema hivyo tena.",
          };

          answer = replies[plang as keyof typeof replies] || replies.en;
        } else {
          answer = data.response;
        }
        // Update state with bot's message
        setMessages([
          ...messages,
          userMessage,
          { role: "bot", content: answer.trim() },
        ]);
      } catch (error) {
        console.error(error);
        setLoading(false);
        // Handle the error, e.g., display a user-friendly message to the user
      }
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const userMessage = { role: "user", content: userInput };
    setMessages([...messages, userMessage]);
    setUserInput("");
    // Call the fetch function
    await startInteract(userInput, userMessage, userLanguage, pid);
  };

  useEffect(() => {
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
      return loaders[randomIndex];
    }
    const chosenImg = getRandomLoader();
    setImgSrc(chosenImg.imgSrc);
  }, [messages]);

  const latestMessage = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (latestMessage.current) {
      latestMessage.current.scrollIntoView();
    }
  }, [messages]);

  return (
    <div className="border-black w-screen flex flex-col h-[100vh] z-10 ">
      {/* Header*/}
      <div className="h-16 px-4 py-3 flex justify-center items-center bg-blue-300 z-10">
        <div className="flex items-center justify-center gap-6 ">
          <div className="flex flex-col">
            <span className="font-bold"> Life Health Chat Assistant</span>
          </div>
        </div>
      </div>

      {/* Messages Container*/}
      <div
        id="message-container"
        className=" bg-white h-[80vh] w-full relative flex-grow overflow-auto"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${
              message.role === "bot"
                ? "bg-green-400 text-black rounded-lg mb-[10px] m-3 p-[10px] lg:max-w-[300px] max-w-[200px]"
                : "bg-teal-600 text-black rounded-lg mb-[10px] p-[10px] lg:max-w-[300px] max-w-[150px] lg:ml-auto lg:mr-1 md:ml-auto md:mr-1 ml-auto mr-3"
            }`}
          >
            {message.content}

          </div>
        ))}
        {loading && (
          <img
            src={imgSrc}
            id="loading"
            className="w-[100px] h-[100px] ml-10"
          />
        )}
        <div ref={latestMessage}></div>
      </div>

      {/* Send Messages*/}
      <div className="bg-rose-500 h-20 px-4 flex items-center gap-4 relative">
        <div className="flex w-full gap-6">
          <form onSubmit={handleSubmit} className="flex w-full gap-6">
            <input
              type="text"
              placeholder="Type a message"
              className="text-sm focus:outline-none h-10 rounded-lg px-5 py-4 w-full"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <div className="flex w-10 items-center justify-center">
              <button type="submit">
                {userInput.length ? (
                  <MdSend
                    className="text-gray-400 cursor-pointer text-xl"
                    title="Talk to Us!"
                  />
                ) : (
                  <FaMicrophone
                    className="text-gray-400 cursor-pointer text-xl"
                    onClick={(e:any) => {
                      e.preventDefault();
                    }}
                  />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
