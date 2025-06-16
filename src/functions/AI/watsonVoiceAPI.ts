import { Message } from "../../types/message";
import { startInteract } from "./watsonAPI";

export async function startVoiceInteract(
  setMessages: React.Dispatch<
    React.SetStateAction<{ role: string; content: string }[]>
  >,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  userMessage: Message,
  messages: { role: string; content: string }[],
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
      //audio_file: audioFile || null,
      audio_data: audioData || null,
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

    const data = await res.json();
    console.log("STT Response:", data);

    setLoading(false);

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const transcript = data["transcript"];
    const transcriptUserMessage = { role: "user", content: transcript };
    startInteract(
      setMessages,
      setLoading,
      updatedMessages,
      transcript,
      userId,
      lang,
      transcriptUserMessage,
      "watsonchat",
      "response"
    );
  } catch (error) {
    console.error("STT Error:", error);

    const errorMessage =
      lang === "en"
        ? "Sorry, there was an error processing your audio."
        : "Sorry, there was an error processing your audio."; // Add translations as needed

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "bot", content: errorMessage },
    ]);

    setLoading(false);
  }
}
