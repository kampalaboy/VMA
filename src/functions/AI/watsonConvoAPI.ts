import { Message } from "../../types/message";
//simport { base64toBlob } from "../../utils/base64";
//import { startInteract } from "./watsonAPI";

export async function startVoiceInteract(
  setMessages: React.Dispatch<
    React.SetStateAction<{ role: string; content: string }[]>
  >,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  userMessage: Message,
  messages: Message[],
  userId: string,
  audioData: string,
  audioFile: string,
  lang: string,
  endpoint: string
) {
  // Validate that we have either audioData or audioFile
  if (!audioData && !audioFile) {
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "bot", content: "No audio data provided." },
    ]);
    return;
  }

  const optionsText: RequestInit = {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "RAG-APP-API-Key": "Quick2go!",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({
      audio_data: audioData || null,
      //"audio_file": "string",
      dbtype: "MYSQL",
      ragllm_instructions:
        "[INST]<<SYS>>You are a helpful, respectful, and honest assistant. Always answer as helpfully as possible, while being safe. Be brief in your answers. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature.\nIf a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don\\'''t know the answer to a question, please do not share false information. <</SYS>>\nGenerate the next agent response by answering the question. You are provided several documents with titles. If the answer comes from different documents please mention all possibilities and use the tiles of documents to separate between topics or domains. Answer with no more than 150 words. If you cannot base your answer on the given document, please state that you do not have an answer.\n{context_str}<</SYS>>\n\n{query_str} Answer with no more than 150 words. If you cannot base your answer on the given document, please state that you do not have an answer. [/INST]",
      es_index_name: "health-docs-index",
      user_id: userId,
      es_index_text_field: "body_content_field",
      es_model_name: ".elser_model_2",
      es_model_text_field: "ml.tokens",
      num_results: "5",
      sqlllm_params: {
        model_id: "meta-llama/llama-3-405b-instruct",
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
        model_id: "meta-llama/llama-3-405b-instruct",
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
        model_id: "meta-llama/llama-3-405b-instruct",
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
        model_id: "meta-llama/llama-3-405b-instruct",
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

  setLoading(true);

  try {
    const res = await fetch(
      `https://cti-app.1r1lw5ypdyix.us-east.codeengine.appdomain.cloud/${endpoint}`,
      //`http://localhost:4050/${endpoint}`,
      optionsText
    );
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const audioBlob = await res.blob();

    const audioUrl = URL.createObjectURL(audioBlob);

    setMessages([
      ...messages,
      userMessage,
      {
        role: "bot",
        content: "🎤 Bot at " + new Date().toLocaleTimeString(),
        audioUrl: audioUrl,
      },
    ]);
    setLoading(false);
  } catch (error) {
    console.error("STT Error:", error);

    const errorMessage =
      lang === "en"
        ? "Sorry, there was an error processing your audio."
        : "Sorry, there was an error processing your audio."; // Add translations as needed

    setMessages([
      ...messages,
      userMessage,
      { role: "bot", content: errorMessage },
    ]);

    setLoading(false);
  }
}
