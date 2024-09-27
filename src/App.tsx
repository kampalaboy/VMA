import React, { useState, useRef, useEffect } from "react";
import "./App.css";
import { MdOutlineHealthAndSafety, MdSend } from "react-icons/md";
import { RiSearch2Line } from "react-icons/ri";

const App: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [userInput, setUserInput] = useState<string>("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [responser, setResponser] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>("");
  const [language, setLanguage] = useState("");
  const [id, setId] = useState<string | null>("");
  const userLanguage = {
    en: "English",
    fr: "French",
    es: "Spanish",
    pt: "Portuguese",
    lg: "Luganda",
    nyn: "Runyankole",
    sw: "Swahili",
    am: "Amharic",
    hi: "Hindi",
    ar: "Arabic",
  };

  const params = window.location.search;
  const urlParams = new URLSearchParams(params);
  const pname = urlParams.get("name") || "";
  const plang = urlParams.get("lang");

  const pid = urlParams.get("id");
  useEffect(() => {
    setId(pid);
  }, [pid]);

  useEffect(() => {
    const welcomeMessages = {
      en: `Welcome to Life Health, ${pname}.  How can I assist?
      
          Use the buttons below as follows:
                🏥 : Query about health or the app ${
                  id
                    ? `
                🔍 : Search your Database`
                    : ""
                }
                => : Try a general question`,
      fr: `Bienvenue sur Life Health, ${pname}.  Comment puis-je vous aider?

          Utilisez les boutons ci-dessous comme suit:
              🏥 : Requête sur la santé ${
                id
                  ? `
             🔍 : Rechercher dans votre base de données`
                  : ""
              }
              => : Essayer une question générale`,

      es: `Bienvenido a Life Health, ${pname}.  ¿En qué puedo ayudar?
      
          Utilice los botones siguientes de la siguiente manera:
                🏥 : Consulta de salud ${
                  id
                    ? ` 
                🔍 : Busca en tu base de datos`
                    : ""
                }
                => : Prueba una pregunta general
          `,
      pt: `Bem-vindo à Life Health, ${pname}. Como posso ajudar?

            Utilize os botões abaixo da seguinte forma:
            🏥 : Consulta sobre saúde ou aplicação ${
              id
                ? ` 
           🔍 : Pesquise a sua base de dados`
                : ""
            }
            => : Tente uma pergunta geral`,
      lg: `Mwaniriziddwa mu Life Health, ${pname}.  Nnyinza ntya okuyamba?

                Kozesa obutambi buno wammanga nga bwe buti:
          🏥 : Okubuuza ku by'obulamu ${
            id
              ? ` 
         🔍 : Noonya ku Database yo`
              : ""
          }
          => : Gezaako ekibuuzo eky'awamu`,
      nyn: `Murakaza neza kubuzima, ${pname}. Nigute nshobora gufasha?`,
      sw: `Karibu kwenye Life Health, ${pname}.  Naweza kukusaidia vipi?

          Tumia vitufe vilivyo hapa chini kama ifuatavyo:
            🏥 : Hoja ya Afya ${
              id
                ? ` 
            🔍 : Tafuta Hifadhidata yako`
                : ""
            }
            => : Jaribu swali la jumla`,

      am: `እንኳን ወደ ሕይወት ጤና፣ ${pname} በደህና መጡ። እንዴት መርዳት እችላለሁ?

            ከዚህ በታች ያሉትን አዝራሮች እንደሚከተለው ተጠቀም።
            🏥 : ስለ ጤና ወይም ስለ መተግበሪያ ጥያቄ ${
              id
                ? ` 
            🔍 ፡ ዳታቤዝህን ፈልግ`
                : ""
            }
            => : አጠቃላይ ጥያቄን ይሞክሩ`,
      hi: `लाइफ हेल्थ में आपका स्वागत है, ${pname}. मैं आपकी सहायता कैसे कर सकता हूँ?

            नीचे दिए गए बटनों का उपयोग इस प्रकार करें:
            🏥 : स्वास्थ्य या ऐप के बारे में प्रश्न ${
              id
                ? ` 
           🔍 : अपना डेटाबेस खोजें`
                : ""
            }
            => : एक सामान्य प्रश्न आज़माएँ`,
      ar: `مرحبًا بك في Life Health، ${pname}. كيف يمكنني المساعدة؟
            استخدم الأزرار أدناه على النحو التالي:

            🏥 : استعلام حول الصحة أو التطبيق ${
              id
                ? `
             🔍 : ابحث في قاعدة البيانات الخاصة بك`
                : ""
            }
            => : جرّب سؤالاً عامًا`,
    };
    setMessages([
      {
        role: "bot",
        content:
          welcomeMessages[plang as keyof typeof welcomeMessages] ||
          `Welcome to Life Health. How can I assist? 

           Use the buttons below as follows:
             🏥 : Query about health or the app 
              => : Try a general question

          `,
      },
    ]);
    setLanguage(plang || "");
  }, [plang, pname, id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!userInput.trim()) return;

    const userMessage = { role: "user", content: userInput };
    setMessages([...messages, userMessage]);
    setUserInput("");
    await startInteract(
      userInput,
      userMessage,
      userLanguage,
      selectedEndpoint,
      responser
    );
  };

  const startInteract = async (
    userInput: string,
    userMessage: { role: string; content: string },
    userLanguage: object,
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
        rag_llm_instructions: `Reply to ${userInput} in the ${userLanguage} determined by the parameter ${language}`,
        es_index_name: "health-docs-index",
        user_id: pid,
        es_index_text_field: "body_content_field",
        es_model_name: ".elser_model_2",
        es_model_text_field: "ml.tokens",
        num_results: "3",
        sqlllm_params: {
          model_id: "ibm/granite-13b-instruct-v2",
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
        classifyllm_params: {
          model_id: "ibm/granite-13b-instruct-v2",
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
          model_id: "ibm/granite-13b-instruct-v2",
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
          model_id: "ibm/granite-13b-instruct-v2",
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
          `https://gen-llm-service.1lvzmjbcniiy.us-south.codeengine.appdomain.cloud/${endpoint}`,
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
            en: "Sorry, say that again.",
            fr: "Désolé, répétez-le.",
            es: "Lo siento, dilo de nuevo.",
            lg: "Bambi, sikutegede ddamu okwogera ekyo.",
            nyn: "Ihangane, ongera ubivuge.",
            sw: "Samahani, sema hivyo tena.",
          };

          answer = replies[plang as keyof typeof replies] || replies.en;
        } else {
          answer = data[responser];
          console.log(answer);
          // answer = answer.replace(/\n?\s*(\d+)\./g, "\n$1.");
          // answer = formatResponse(data.response);
        }
        setMessages([
          ...messages,
          userMessage,
          { role: "bot", content: answer.trim() },
        ]);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }
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
                ? "bg-green-400 text-black rounded-lg mb-[10px] m-3 p-[10px] max-w-fit break-words "
                : "bg-teal-600 text-black rounded-lg mb-[10px] p-[10px] break-words max-w-fit self-end lg:ml-auto lg:mr-1 md:ml-auto md:mr-1 ml-auto mr-3"
            }`}
            style={{
              wordBreak: "break-word",
              // whiteSpace: "pre-wrap",
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
            src={imgSrc}
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
                <button
                  className="rounded-full p-1 left-0 bg-transparent"
                  type="submit"
                  onClick={() => {
                    setSelectedEndpoint("queryLLM");
                    setResponser("llm_response");
                  }}
                >
                  <MdOutlineHealthAndSafety size={23} />
                </button>
                {id && (
                  <button
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
              className="rounded-full p-1 bg-transparent"
              type="submit"
              onClick={() => {
                setSelectedEndpoint("queryLLM");
                setResponser("llm_response");
              }}
            >
              <MdSend
                color="black"
                className=" text-gray-400 cursor-pointer text-xl"
                title="Talk to Us!"
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
