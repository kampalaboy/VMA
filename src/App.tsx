import React, { useState, FormEvent, useRef, useEffect } from 'react';
import './App.css';
import { FaMicrophone } from "react-icons/fa";
import { MdSend } from "react-icons/md";


const App: React.FC = () => {

  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] =useState<boolean>(false);
  

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    

    const userMessage = { role: 'user', content: userInput };
    setMessages([...messages, userMessage]);
    setUserInput('');
    // Call the fetch function
    
    await startInteract(userInput, userMessage);
  };
  const initialMessage = "Welcome to Life Health, how may I assist you today?"

    useEffect(() => {
      setMessages([{ role: 'bot', content: initialMessage }]);
    }, []);
  

  const startInteract = async (userInput: string, userMessage: { role: string; content: string }) => {
    

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
          system: `You are an AI FAQ assistant for LifeHealth Global. 
                    Information will be provided to help answer the user's questions.                    

                    If ${userInput} is a greeting, then respond with appropriate greeting.
                    Always summarize your response to be as brief as possible and be extremely concise. 
                    Your responses should be fewer than a couple of sentences. 
                    Do not reference the material provided in your response.  
                    please help this user with their question using the provided information. 
                    Please rephrase the information in a clearer and more conversational way.

                    If your answer is going to be longer than usual because of deeper explanation, put bullet points.  
                    Do the bullet points especially when the question is about steps to take.
                    
                     
                  
                    `
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
              {loading && <img src="assets/loaders/heartyread.gif" id="loading" className="w-[100px] h-[100px] ml-10"/> 
                       
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
