import React, { useState, FormEvent } from 'react';
import './App.css';


const App: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([{ role: 'bot', content: 'Welcome to Life Health, how can I assist?' }]);
  const [userInput, setUserInput] = useState<string>('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const userMessage = { role: 'user', content: userInput };
    setMessages([...messages, userMessage]);
    setUserInput('');
    // Call the fetch function
    await startInteract(userInput, userMessage);
  };


  const startInteract = async (userInput: string, userMessage: { role: string; content: string }) => {
    const options: RequestInit = {
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

    try {
      const response = await fetch('https://general-runtime.voiceflow.com/knowledge-base/query', options);
      const data = await response.json();
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
      // Handle the error, e.g., display a user-friendly message to the user
    }        
  };

  return (
    <main className='min-h-screen w-screen flex flex-col justify-center'>
      <div className="min-h-[670px] w-screen flex flex-col justify-center">
        <div className="fixed w-full z-10 bg-teal-800 text-white px-4 py-2 top-0">
          <h1 className="text-lg text-center font-semibold">LIFE HEALTH GLOBAL ASSISTANT</h1>
        </div>        
        {/* Chat container */}
        <div className='backgroundImage flex-grow px-4 py-10'>
          {/* Chat messages */}0
          {messages.map((message, index) => (
            <div key={index} className={`speech ${message.role === 'bot' ? 'bg-green-400 rounded-lg mb-[10px] p-[10px] lg:max-w-[300px] max-w-[150px]' : 'bg-teal-600 rounded-lg mb-[10px] p-[10px] lg:max-w-[300px] max-w-[150px] lg:ml-auto lg:mr-1 md:ml-auto md:mr-1 ml-auto mr-1'}`}>
              {message.content}
            </div>
          ))}
        </div>
        
        {/* Input form */}
        <form onSubmit={handleSubmit} className="bg-rose-700  border-lime-300 px-4 py-3 flex items-center">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
          />
          <button type="submit" className="ml-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none">
            Send
          </button>
        </form>
      </div>
    </main>
  );
};

export default App;
