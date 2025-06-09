export async function startInteract(
  setMessages: React.Dispatch<
    React.SetStateAction<{ role: string; content: string }[]>
  >,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  messages: { role: string; content: string }[],
  userInput: string,
  userId: string,
  lang: string,
  userMessage: { role: string; content: string },
  endpoint: string,
  responser: string
) {
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
      user_id: userId,
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
        const plang = lang;
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
}
