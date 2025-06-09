import { Message } from "../../types/message";
export async function startInteract(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  messages: Message[],
  user: string,
  userInput: string,
  userId: string,
  lang: string,
  userMessage: Message,
  //endpoint: string,
  responser: string
) {
  const updateId = Math.floor(Math.random() * 1000000);
  const messageId = Math.floor(Math.random() * 1000000);

  const optionsText: RequestInit = {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify([
      {
        sessionId: userId,
        update_id: updateId,
        message: {
          message_id: messageId,
          from: {
            id: userId,
            is_bot: false,
            first_name: user,
            username: user,
            language_code: lang,
          },
          chat: {
            id: userId,
            first_name: user,
            username: user,
            type: "private",
          },
          date: Math.floor(Date.now() / 1000),
          chatInput: userInput,
          // voice: {
          //   file_name: userMessage.audioUrl,
          //   mime_type: "audio/wav",
          //   data: userMessage.audioUrl,
          // },
        },
      },
    ]),
  };

  if (userInput) {
    setLoading(true);
    try {
      const res = await fetch(
        `https://n8n.ecobetug.com/webhook/bf4dd093-bb02-472c-9454-7ab9af97bd1d`,
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
      } else {
        answer = data[responser];
        answer = answer.replace(/\*/g, "");
        console.log(answer);
        setMessages([
          ...messages,
          userMessage,
          { role: "bot", content: answer.trim() },
        ]);
      }
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
