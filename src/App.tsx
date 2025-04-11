import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { MdSend } from "react-icons/md";
import { RiSearch2Line } from "react-icons/ri";

const App: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [userInput, setUserInput] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [responser, setResponser] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const params = window.location.search;
  const urlParams = new URLSearchParams(params);
  const pname = urlParams.get("name") || "";
  const plang = urlParams.get("lang");

  const pid = urlParams.get("id") || "";
  useEffect(() => {
    setUserId(pid);
  }, [pid]);

  useEffect(() => {
    const welcomeMessages = {
      en: `Hello, ${pname}.  I'm VIMA. How can I help?
            ${userId ? `🔍 : Search your Database` : ""}
          `,
      fr: `Bienvenue sur Life Health, ${pname}.  Comment puis-je vous aider?
            ${userId ? `🔍 : Rechercher dans votre base de données` : ""}
          `,

      es: `Bienvenido a Life Health, ${pname}.  ¿En qué puedo ayudar?
            ${userId ? ` 🔍 : Busca en tu base de datos` : ""}
          `,
      pt: `Bem-vindo à Life Health, ${pname}. Como posso ajudar?
            ${userId ? ` 🔍 : Pesquise a sua base de dados` : ""}
          `,
      lg: `Mwaniriziddwa mu Life Health, ${pname}.  Nnyinza ntya okuyamba?
            ${userId ? ` 🔍 : Noonya ku Database yo` : ""}
          `,
      nyn: `Murakaza neza kubuzima, ${pname}. Nigute nshobora gufasha?`,
      sw: `Karibu kwenye Life Health, ${pname}.  Naweza kukusaidia vipi?
            ${userId ? ` 🔍 : Tafuta Hifadhidata yako` : ""}       
            `,
      am: `እንኳን ወደ ሕይወት ጤና፣ ${pname} በደህና መጡ። እንዴት መርዳት እችላለሁ?
          ${userId ? `🔍 ፡ ዳታቤዝህን ፈልግ` : ""}
            `,
      hi: `लाइफ हेल्थ में आपका स्वागत है, ${pname}. मैं आपकी सहायता कैसे कर सकता हूँ?
          ${userId ? `🔍 : अपना डेटाबेस खोजें` : ""}
            `,
      ar: `مرحبًا بك في Life Health، ${pname}. كيف يمكنني المساعدة؟
          ${userId ? ` 🔍 : ابحث في قاعدة البيانات الخاصة بك` : ""}
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
  }, [plang, pname, userId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userInput.trim()) return;

    const userMessage = { role: "user", content: userInput };
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
        dbtype: "MYSQL",
        ragllm_instructions: `[<|system|>\nYou are LifeHealth ChatBot. You are a cautious assistant. You carefully follow instructions. You are helpful and harmless and you follow ethical guidelines and promote positive behavior. If {query_str} is a greeting respond appropriately. Information will be provided to help answer the user's questions.  If you do not find the answer reply to the question appropriately.Also information will be provided on how to handle various support chain tasks i.e. troubleshooting, replying to reviews, answering FAQs. Please do not waste the response on any words other than the response. You look through the documents provided and find the appropriate response to {query_str}.
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
          user_id: pid,
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
          `https://cti-app.1r1lw5ypdyix.us-east.codeengine.appdomain.cloud/${endpoint}`,
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
    for (let i = 0; i < loaders.length; i++) {
      const randomLoader = Math.floor(Math.random() * i);
      const imgSrc = loaders[randomLoader].imgSrc;
      return imgSrc;
    }
  }
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
            <span className="font-bold"> VIMA</span>
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
                ? "bg-green-400 text-black rounded-lg mb-[10px] m-3 p-[10px] max-w-fit mr-10"
                : "bg-teal-600 text-black rounded-lg mb-[10px] p-[10px] break-words w-fit max-w-[90%] lg:ml-auto lg:mr-1 md:ml-auto md:mr-1 ml-auto mr-3"
            }`}
            style={{
              wordBreak: "break-word",
            }}
          >
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

      {/* Send Messages*/}
      <div className="bg-rose-500 h-20 px-4 flex items-center relative">
        <div className="flex w-full">
          <form
            onSubmit={handleSubmit}
            className="flex w-full  gap-x-2 space-x-1"
          >
            <div className="relative w-full gap-x-2">
              <input
                id="inputBot"
                type="text"
                placeholder="Type a message"
                className="text-sm focus:outline-none h-10 rounded-lg px-5 py-4 w-full pr-24"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-3 ">
                {userId && (
                  <button
                    id="dbQuery"
                    className="rounded-full p-1 bg-transparent"
                    type="submit"
                    onClick={() => {
                      setSelectedEndpoint("watsonchat");
                      setResponser("response");
                    }}
                  >
                    <RiSearch2Line size={23} />
                  </button>
                )}
              </div>
            </div>
            <button
              id="generalQuery"
              className="rounded-full p-1 bg-transparent"
              type="submit"
              onClick={() => {
                setSelectedEndpoint("watsonchat");
                setResponser("response");
              }}
            >
              <MdSend
                color="black"
                className=" text-gray-400 cursor-pointer text-xl"
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
