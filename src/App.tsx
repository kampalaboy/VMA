import React, { useState, FormEvent, useRef, useEffect } from 'react';
import './App.css';
import { FaMicrophone } from "react-icons/fa";
import { MdSend } from "react-icons/md";


const App: React.FC = () => {

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] =useState<boolean>(false);
  const [imgSrc, setImgSrc] = useState<string>('');
   const [language, setLanguage] = useState('');

  const userLanguage = {eng: 'English', 
                        fr: 'French', 
                        esp:'Spanish', 
                        swa:'Kiswahili', 
                        lug:'Luganda', } 

  useEffect(()=>{
          const params = window.location.search;
          const urlParams = new URLSearchParams(params);
                      
          const pname = urlParams.get('name') || ''
          const plang = urlParams.get('lang')
                      
          const welcomeMessages = {
                  eng: `Welcome to Life Health, ${pname} how can I assist?`,
                  fr: `Bienvenue sur Life Health, ${pname}, comment puis-je vous aider ?`,
                  esp: `Bienvenido a Life Health, ${pname} ¿en qué puedo ayudar?`,
                  swa: `Karibu kwenye Life Health, ${pname} naweza kukusaidia vipi?`,
                  lug: `Mwaniriziddwa mu Life Health, ${pname} nnyinza ntya okuyamba?`
                            // Add more languages as needed
                  };
                      
                  setMessages([
                      { role: 'bot', content: welcomeMessages[plang  as keyof typeof welcomeMessages]|| welcomeMessages.eng}
                            ]);
                  setLanguage(plang || '')
                },[])                      
  

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    

    const userMessage = { role: 'user', content: userInput };
    setMessages([...messages, userMessage]);
    setUserInput('');
    // Call the fetch function
    await startInteract(userInput, userMessage, language, userLanguage);
  };

  const startInteract = async (userInput: string, userMessage: { role: string; content: string }, language: string, userLanguage:object) => {
    

    const optionsText: RequestInit = {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': import.meta.env.VITE_DIALOG_API || '',
        'versionID': import.meta.env.VITE_VERSION_ID || ''
      },
      body: JSON.stringify({
        chunkLimit: 2,
        synthesis: true,
        settings: {
          model: 'gpt-3.5-turbo',
          temperature: 0.1,
          system:`You are an AI FAQ assistant for LifeHealth Global. 
                  Information will be provided to help answer the user's questions.
                  
                  First of all check to see the ${language} then use the list of ${userLanguage} to pick the right language.  
                  If ${userInput} is in a certain ${userLanguage} then respond to the questions in that ${userLanguage}

                  ###
                  If ${userInput} is a greeting, then respond with appropriate greeting.

                  ${userInput} : 'Hello'
                  response : 'Hello, how are you?'

                  ${userInput} = 'Hi'
                  response : 'Hi, how are you doing?'

                  ${userInput} : 'What's up'
                  response : 'Am doing good, how about you?'

                  ###
                  If ${userInput} is a question, then respond with appropriate answer.

                  Always summarize your response to be as brief as possible and be concise. 
                  Your responses should be fewer than a four sentences. 
                  Do not reference the material provided in your response.  
                  Please help this user with their question using the provided information. 
                  Please rephrase the information in a clearer and more conversational way.

                  
                  ###
                  If your answer is going to be longer than usual because of deeper explanation, number the steps to take.  
                  Number the steps, and make sure the next step is a the beginning of a newline.
                  That is: 
                  1.
                  2.
                  3.
                  4.
                  etc
                  The numbers should always be the first character of a new line containing the next step to take. 

                  ${userInput}: How do I get a Life Health wallet?
                  response : 
                  To get a LifeHealth Wallet, you can follow these steps: 
                  1. Download the LifeHealth Wallet mobile app from your app store. 
                  2. Open the app and click on the "Getting Started" section. 
                  3. Follow the instructions to create a LifeHealth Wallet account. 
                  4. Complete the self-registration process by providing the required information. 
                  5. Once registered, you can log in to your LifeHealth Wallet using your credentials. 
                  6. Start using the app to access your personal medical records, store health vitals, manage appointments, and more.
          `,

        language: language,
        userLanguage: userLanguage,
        },
        question: userInput,
      })
    };

    if (userInput) {
      setLoading(true); // Show loader before making the API call
    try {
      const response = await fetch('https://general-runtime.voiceflow.com/knowledge-base/query', optionsText);
      const data = await response.json();

      setLoading(false);
      console.log(data);
      // Extract the answer from the chunks array
      let answer: string = data.output;
        if (data.output==null){
          answer = 'Sorry, say that again.'
        }
      // Update state with bot's message
      setMessages([...messages, userMessage, { role: 'bot', content: answer.trim() }]);
    } catch (error) {
      console.error(error);
      setLoading(false);
      // Handle the error, e.g., display a user-friendly message to the user
    }        
  }};

  useEffect(() => {
    const loaders = [
      {id:1, imgSrc: 'assets/loaders/heartythink.gif' },
      {id:2, imgSrc: 'assets/loaders/heartyread.gif' },
      {id:3, imgSrc: 'assets/loaders/heartynotes.gif' },
      {id:4, imgSrc: 'assets/loaders/heartysearch.gif' },
      {id:5, imgSrc: 'assets/loaders/heartycompare.gif' },
      {id:6, imgSrc: 'assets/loaders/heartywave.gif' },
    ];
    
    
    function getRandomLoader() {
      const randomIndex = Math.floor(Math.random() * loaders.length);
      return loaders[randomIndex];
    }
    const chosenImg1 = getRandomLoader();
    const chosenImg2 = getRandomLoader();
    const chosenImg3 = getRandomLoader();
    setImgSrc(chosenImg1.imgSrc||chosenImg2.imgSrc||chosenImg3.imgSrc)
  },[]);
  
  const latestMessage = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if (latestMessage.current){
      latestMessage.current.scrollIntoView();
    }
  }, [messages]);

  return(
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
       <div id='message-container' className=" bg-white h-[80vh] w-full relative flex-grow overflow-auto">
      
            {messages.map((message, index) => (
                <div key={index} className={`${message.role === 'bot' ? 'bg-green-400 text-black rounded-lg mb-[10px] m-3 p-[10px] lg:max-w-[300px] max-w-[200px]' :
                                                                        'bg-teal-600 text-black rounded-lg mb-[10px] p-[10px] lg:max-w-[300px] max-w-[150px] lg:ml-auto lg:mr-1 md:ml-auto md:mr-1 ml-auto mr-3'}`}>
                {message.content}
                </div> 
              ))}
              {loading && <img src={imgSrc} id="loading" className="w-[100px] h-[100px] ml-10"/> 
                       
              }
               <div ref={latestMessage}></div>
        </div>

        {/* Send Messages*/}
        <div className="bg-rose-500 h-20 px-4 flex items-center gap-4 relative">            
            <div className="flex w-full gap-6">
                <form onSubmit={handleSubmit} className="flex w-full gap-6" >
                        <input 
                        type="text" 
                        placeholder="Type a message" 
                        className="text-sm focus:outline-none h-10 rounded-lg px-5 py-4 w-full"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                         />
                    <div className="flex w-10 items-center justify-center">
                    
                        <button type='submit'>
                        {userInput.length ? (
                            <MdSend className="text-gray-400 cursor-pointer text-xl" title="Talk to Us!"/>
                            ):(
                             <FaMicrophone className="text-gray-400 cursor-pointer text-xl" 
                                           onClick={(event)=>{
                                                                event.preventDefault();                                                              
                                                             }}/>
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
