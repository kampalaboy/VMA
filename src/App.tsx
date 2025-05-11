import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { MdSend } from "react-icons/md";
// import SpeechToText from "./functions/stt";
// import { FaMicrophone } from "react-icons/fa";
import VoiceButton from "./functions/voicebutton";

const App: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );

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
        question: messages.toString() + userInput,
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
          user_id: pid,
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
          `https://cti-app.1r1lw5ypdyix.us-east.codeengine.appdomain.cloud/${endpoint}`,
          //`http://localhost:4050/${endpoint}`,
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
      <div className="h-16 px-4 py-3 flex justify-center items-center bg-blue-600 z-10">
        <div className="flex items-center justify-center gap-6 ">
          <div className="flex flex-col">
            <span className="font-bold"> VIMA</span>
          </div>
        </div>
      </div>

      {/* Messages Container*/}
      <div
        id="message-container"
        className=" bg-white h-[80vh] w-full relative flex-grow overflow-auto scroll"
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
      <div className="bg-rose-600 h-20 px-4 flex items-center relative">
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
            </div>
            <VoiceButton setUserInput={setUserInput} />
            <button
              id="query"
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

// import React, { useState, useRef, useEffect } from "react";
// import "./App.css"; // Make sure this file exists or remove if not used
// import { MdSend } from "react-icons/md";
// // import SpeechToText from "./functions/stt";
// // import { FaMicrophone } from "react-icons/fa";
// //import VoiceButton from "./functions/voicebutton";

// const App: React.FC = () => {
//   const [messages, setMessages] = useState<{ role: string; content: string }[]>(
//     []
//   );
//   const [userInput, setUserInput] = useState<string>("");
//   // convo is now a state variable to store the conversation history for context
//   const [convoHistory, setConvoHistory] = useState<
//     { role: string; content: string }[]
//   >([]);

//   const [selectedEndpoint, setSelectedEndpoint] =
//     useState<string>("watsonchat"); // Default endpoint
//   const [responserKey, setResponserKey] = useState<string>("response"); // Default response key
//   const [loading, setLoading] = useState<boolean>(false);

//   const params = window.location.search;
//   const urlParams = new URLSearchParams(params);
//   const pname = urlParams.get("name") || "";
//   const plang = urlParams.get("lang");
//   const pid = urlParams.get("id") || "";

//   useEffect(() => {
//     const welcomeMessages = {
//       en: `Hello, ${pname}. I'm VIMA. How can I help?`,
//       fr: `Bonjour, ${pname}. Je suis VIMA. Comment puis-je vous aider?`,
//       es: `Hola, ${pname}. Soy VIMA. ¿Cómo puedo ayudarte?`,
//       pt: `Olá, ${pname}. Eu sou VIMA. Como posso ajudar?`,
//       lg: `Oli otya, ${pname}. Nze VIMA. Nnyamba ntya?`,
//       nyn: `Oraire ${pname}. Ndi VIMA. Ninkukoonyera nta?`,
//       sw: `Hujambo, ${pname}. Mimi ni VIMA. Nawezaje kusaidia?`,
//       am: `ሰላም, ${pname}. እኔ VIMA ነኝ። እንዴት ልረዳዎት?`,
//       hi: `नमस्ते, ${pname}। मैं VIMA हूं। मैं कैसे मदद कर सकता हूं?`,
//       ar: `مرحباً ${pname}. أنا VIMA. كيف يمكنني المساعدة؟`,
//     };
//     const initialBotMessageContent =
//       welcomeMessages[plang as keyof typeof welcomeMessages] ||
//       `Hello I'm VIMA. How can I help you?`;

//     const initialBotMessage = {
//       role: "bot",
//       content: initialBotMessageContent,
//     };
//     setMessages([initialBotMessage]);
//     // Initialize conversation history with the welcome message
//     setConvoHistory([initialBotMessage]);
//   }, [plang, pname]);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();

//     if (!userInput.trim()) return;

//     const userMessage = { role: "user", content: userInput };

//     // Update messages for display
//     setMessages((prevMessages) => [...prevMessages, userMessage]);
//     // Update conversation history for context
//     // We'll add the bot's response to convoHistory later in startInteract
//     setConvoHistory((prevConvo) => [...prevConvo, userMessage]);
//     console.log(convoHistory);
//     const currentInput = userInput; // Capture userInput before clearing
//     setUserInput("");
//     // Pass currentInput and the most up-to-date convoHistory (which now includes the latest user message)
//     await startInteract(currentInput, selectedEndpoint, responserKey, [
//       ...convoHistory,
//       userMessage,
//     ]);
//   };

//   const startInteract = async (
//     currentQuery: string,
//     endpoint: string,
//     responseProperty: string,
//     currentConversation: { role: string; content: string }[] // Pass the latest conversation
//   ) => {
//     setLoading(true);

//     // Format the conversation history for the context_str
//     // The last message in currentConversation is the current user query.
//     // So, context_str should be everything *before* that, or include it if your LLM prompt handles it.
//     // Based on your prompt: <|user|>\n{context_str}\n\n{query_str}\n<|assistant|>
//     // {context_str} should be the history *before* the current {query_str}.
//     const contextMessages = currentConversation.slice(0, -1); // All but the last (current) user message
//     const contextString = contextMessages
//       .map((msg) => `<|${msg.role}|>\n${msg.content}`) // Format as per your LLM's expectation
//       .join("\n\n"); // Join messages with a clear separator

//     const optionsText: RequestInit = {
//       method: "POST",
//       headers: {
//         accept: "application/json",
//         "Content-Type": "application/json",
//         "RAG-APP-API-Key": "Quick2go!", // Consider moving to environment variables
//         "Access-Control-Allow-Origin": "*", // Be cautious with * in production
//       },
//       body: JSON.stringify({
//         question: currentQuery, // This will be {query_str}
//         dbtype: "MYSQL",
//         ragllm_instructions: `[<|system|>\nYou are LifeHealth ChatBot. You are a cautious assistant. You carefully follow instructions. You are helpful and harmless and you follow ethical guidelines and promote positive behavior. If {query_str} is a greeting respond appropriately. Information will be provided to help answer the user's questions.  If you do not find the answer reply to the question appropriately.Also information will be provided on how to handle various support chain tasks i.e. troubleshooting, replying to reviews, answering FAQs. Please do not waste the response on any words other than the response. You look through the documents provided and find the appropriate response to {query_str}.
//                               If the response makes sense as a list of steps number the steps accordingly using a \\n to print the steps and answer only using the list of numbered steps like: 1.\\n 2.\\n 3.\\nOtherwise, one sentence answers do not need the numbered steps just provide the response. Respond to {query_str} in the same language as {query_str} Take the same response in the documents and translate to the {query_str} language. <|user|>\n${contextString}\n\n{query_str}\n<|assistant|>`,
//         es_index_name: "health-docs-index",
//         user_id: pid,
//         es_index_text_field: "body_content_field",
//         es_model_name: ".elser_model_2",
//         es_model_text_field: "ml.tokens",
//         num_results: "1",
//         sqlllm_params: {
//           model_id: "meta-llama/llama-3-405b-instruct",
//           inputs: [], // You might also need to pass formatted history here if the model_id requires it directly
//           user_id: pid,
//           parameters: {
//             decoding_method: "greedy",
//             max_new_tokens: 300,
//             min_new_tokens: 1,
//             moderations: {
//               hap_input: "true",
//               hap_output: "true",
//               threshold: 0.75,
//             },
//             repetition_penalty: 1.1,
//             temperature: 0.7,
//             top_k: 50,
//             top_p: 1,
//           },
//         },
//         classifyllm_params: {
//           model_id: "meta-llama/llama-3-405b-instruct",
//           inputs: [],
//           parameters: {
//             decoding_method: "greedy",
//             max_new_tokens: 100,
//             min_new_tokens: 1,
//             moderations: {
//               hap_input: "true",
//               hap_output: "true",
//               threshold: 0.75,
//             },
//             repetition_penalty: 1.1,
//             temperature: 0.7,
//             top_k: 50,
//             top_p: 1,
//           },
//         },
//         ragllm_params: {
//           model_id: "meta-llama/llama-3-405b-instruct",
//           inputs: [], // Some RAG setups might expect conversation history here as well
//           parameters: {
//             decoding_method: "greedy",
//             max_new_tokens: 100,
//             min_new_tokens: 1,
//             moderations: {
//               hap_input: "true",
//               hap_output: "true",
//               threshold: 0.75,
//             },
//             repetition_penalty: 1.1,
//             temperature: 0.7,
//             top_k: 50,
//             top_p: 1,
//           },
//         },
//         generalllm_params: {
//           model_id: "meta-llama/llama-3-405b-instruct",
//           inputs: [],
//           parameters: {
//             decoding_method: "greedy",
//             max_new_tokens: 100,
//             min_new_tokens: 1,
//             moderations: {
//               hap_input: "true",
//               hap_output: "true",
//               threshold: 0.75,
//             },
//             repetition_penalty: 1.1,
//             temperature: 0.7,
//             top_k: 50,
//             top_p: 1,
//           },
//         },
//       }),
//     };

//     try {
//       const res = await fetch(
//         //`https://cti-app.1r1lw5ypdyix.us-east.codeengine.appdomain.cloud/${endpoint}`,
//         `http://localhost:4050/${endpoint}`,
//         optionsText
//       );
//       console.log("API Request Body:", JSON.parse(optionsText.body as string));
//       console.log("API Response Status:", res.status);

//       if (!res.ok) {
//         // Handle HTTP errors like 4xx, 5xx
//         const errorData = await res.text(); // Try to get error text
//         console.error("API Error Response:", errorData);
//         throw new Error(
//           `API request failed with status ${res.status}: ${errorData}`
//         );
//       }

//       const data = await res.json();
//       console.log("API Response Data:", data);
//       setLoading(false);

//       let answer: string;
//       if (
//         data &&
//         data[responseProperty] &&
//         data[responseProperty].trim() !== ""
//       ) {
//         answer = data[responseProperty];
//       } else if (data && data.response && data.response.trim() !== "") {
//         // Fallback to 'response' key
//         answer = data.response;
//       } else {
//         const currentPlang = urlParams.get("lang") || "en";
//         const replies = {
//           en: "Sorry, I could not find what you were looking for or the response was empty.",
//           fr: "Désolé, je n'ai pas trouvé ce que vous cherchiez ou la réponse était vide.",
//           es: "Lo siento, no pude encontrar lo que buscabas o la respuesta estaba vacía.",
//           pt: "Desculpe, não consegui encontrar o que procurava ou a resposta estava vazia.",
//           lg: "Bambi, Ssisobodde kufuna ekyo kyo'nonya oba eddamu lyabadde tterimu.",
//           nyn: "Ihangane, tindikubashaana ebiwashaba nari ebyagarukamu nibyabusha.",
//           sw: "Samahani, sikuweza kupata ulichokuwa unatafuta au jibu lilikuwa tupu.",
//           am: `ይቅርታ, የሚፈልጉትን ማግኘት አልቻልኩም ወይም ምላሹ ባዶ ነበር.`,
//           hi: `क्षमा करें, मुझे वह नहीं मिला जिसकी आप तलाश कर रहे थे या प्रतिक्रिया खाली थी।`,
//           ar: `آسف، لم أتمكن من العثور على ما كنت تبحث عنه أو كان الرد فارغًا.`,
//         };
//         answer = replies[currentPlang as keyof typeof replies] || replies.en;
//       }

//       const botMessage = { role: "bot", content: answer.trim() };
//       setMessages((prevMessages) => [...prevMessages, botMessage]);
//       // Add bot's response to conversation history
//       setConvoHistory((prevConvo) => [...prevConvo, botMessage]);
//     } catch (error) {
//       console.error("Interaction error:", error);
//       setLoading(false);
//       const errorContent =
//         error instanceof Error && error.message.includes("API request failed")
//           ? `Error: ${error.message}. Please check the console for more details.`
//           : "Something went wrong. Please try again.";
//       const errorMessage = { role: "bot", content: errorContent };

//       setMessages((prevMessages) => [...prevMessages, errorMessage]);
//       // Also add error message to convoHistory so the LLM knows an error occurred if it affects context
//       setConvoHistory((prevConvo) => [...prevConvo, errorMessage]);
//     }
//   };

//   const latestMessage = useRef<HTMLDivElement>(null);
//   const loaders = [
//     { id: 1, imgSrc: "assets/loaders/heartythink.gif" },
//     { id: 2, imgSrc: "assets/loaders/heartyread.gif" },
//     { id: 3, imgSrc: "assets/loaders/heartynotes.gif" },
//     { id: 4, imgSrc: "assets/loaders/heartysearch.gif" },
//     { id: 5, imgSrc: "assets/loaders/heartycompare.gif" },
//     { id: 6, imgSrc: "assets/loaders/heartywave.gif" },
//   ];

//   function getRandomLoader(): string {
//     // Ensure loaders array is not empty to prevent error
//     if (loaders.length === 0) return "assets/loaders/default_loader.gif"; // Fallback loader
//     const randomIndex = Math.floor(Math.random() * loaders.length);
//     return loaders[randomIndex].imgSrc;
//   }

//   useEffect(() => {
//     if (latestMessage.current) {
//       latestMessage.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   return (
//     <div className="border-black w-screen flex flex-col h-[100vh] z-10 ">
//       {/* Header*/}
//       <div className="h-16 px-4 py-3 flex justify-center items-center bg-blue-600 z-10">
//         <div className="flex items-center justify-center gap-6 ">
//           <div className="flex flex-col">
//             <span className="font-bold text-white"> VIMA</span>{" "}
//             {/* Added text-white for better visibility */}
//           </div>
//         </div>
//       </div>

//       {/* Messages Container*/}
//       <div
//         id="message-container"
//         className=" bg-white h-[calc(100vh-8rem-1.5rem-20px)] w-full relative flex-grow overflow-y-auto scroll p-4" /* Adjusted height & overflow, added padding */
//       >
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             ref={index === messages.length - 1 ? latestMessage : null}
//             className={`mb-3 p-3 rounded-lg max-w-[80%] clear-both ${
//               /* Common styles */
//               message.role === "bot"
//                 ? "bg-green-400 text-black float-left" /* Bot messages */
//                 : "bg-teal-600 text-white float-right" /* User messages - changed text to white for contrast */
//             }`}
//             style={{
//               wordBreak: "break-word",
//             }}
//           >
//             {message.content.split("\n").map((line, i) => (
//               <React.Fragment key={i}>
//                 {line}
//                 {i < message.content.split("\n").length - 1 && <br />}
//               </React.Fragment>
//             ))}
//           </div>
//         ))}
//         <div className="clear-both"></div> {/* Clear floats */}
//         {loading && (
//           <div className="flex justify-start p-3 clear-both">
//             {" "}
//             {/* Aligned with bot messages */}
//             <img
//               src={getRandomLoader()}
//               alt="Loading..."
//               id="loading"
//               className="w-[70px] h-[70px]" /* Slightly smaller loader */
//             />
//           </div>
//         )}
//         {/* This ref helps scroll to bottom, but attaching to last message is often better */}
//         {/* <div ref={latestMessage}></div> */}
//       </div>

//       <div className="bg-white overflow-hidden pt-1 border-t border-gray-200">
//         {" "}
//         {/* Added border */}
//         <p className="text-gray-500 text-[10px] text-center px-2">
//           {" "}
//           {/* Centered and padded */}
//           AI-generated content may be inaccurate or misleading. Always check for
//           accuracy.
//         </p>
//       </div>
//       {/* Send Messages*/}
//       <div className="bg-rose-600 h-20 px-4 flex items-center relative">
//         <form
//           onSubmit={handleSubmit}
//           className="flex w-full items-center gap-x-2" /* items-center for vertical alignment */
//         >
//           <div className="relative flex-grow">
//             {" "}
//             {/* flex-grow to take available space */}
//             <input
//               id="inputBot"
//               type="text"
//               placeholder="Type a message..." /* Added ellipsis */
//               className="text-sm focus:outline-none h-12 rounded-lg px-5 py-3 w-full pr-12" /* Adjusted padding and height */
//               value={userInput}
//               onChange={(e) => setUserInput(e.target.value)}
//               disabled={loading}
//             />
//           </div>
//           {/* <VoiceButton setUserInput={setUserInput} /> */}
//           <button
//             id="query"
//             aria-label="Send message" /* Accessibility */
//             className="rounded-full p-3 bg-white hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" /* Enhanced styling */
//             type="submit"
//             onClick={() => {
//               // This onClick on button is fine if it's the primary action.
//               // selectedEndpoint and responserKey are now defaulted in useState.
//               // If you need to change them dynamically, you'd set them before calling handleSubmit.
//               setSelectedEndpoint("watsonchat");
//               setResponserKey("response");
//             }}
//             disabled={loading || !userInput.trim()}
//           >
//             <MdSend color="black" className="text-xl" /* Adjusted size */ />
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default App;
