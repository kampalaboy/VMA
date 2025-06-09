import { Message } from "../../types/message";

interface VoiceAPIPayload {
  headers: {
    host: string;
    "user-agent": string;
    "content-type": string;
    "x-api-key": string;
  };
  params: object;
  query: object;
  body: [
    {
      sessionId: number;
      update_id: number;
      message: {
        message_id: number;
        from: {
          id: number;
          is_bot: boolean;
          first_name: string;
          username: string;
          language_code: string;
        };
        chat: {
          id: number;
          first_name: string;
          username: string;
          type: string;
        };
        date: number;
        voice: {
          file_name: string;
          mime_type: string;
          data: string;
        };
      };
    }
  ];
  webhookUrl: string;
  executionMode: string;
}

export async function startInteract(
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  messages: Message[],
  user: string,
  userId: string,
  lang: string,
  userMessage: Message,
  audioData: string // Base64 audio data from microphone
) {
  setLoading(true);

  try {
    const webhookUrl =
      "https://n8n.ecobetug.com/webhook/bf4dd093-bb02-472c-9454-7ab9af97bd1d";
    const payload: VoiceAPIPayload[] = [
      {
        headers: {
          host: "n8n.ecobetug.com",
          "user-agent": "ReactApp/1.0",
          "content-type": "application/json",
          "x-api-key": "YOUR_API_KEY_HERE",
        },
        params: {},
        query: {},
        body: [
          {
            sessionId: 1,
            update_id: Math.floor(Math.random() * 1000000),
            message: {
              message_id: Math.floor(Math.random() * 1000000),
              from: {
                id: parseInt(userId) || 12345,
                is_bot: false,
                first_name: user,
                username: user,
                language_code: lang,
              },
              chat: {
                id: parseInt(userId) || 5384581914,
                first_name: user,
                username: user,
                type: "private",
              },
              date: Math.floor(Date.now() / 1000),
              voice: {
                file_name: userMessage.audioUrl || "",
                mime_type: "audio/mp3",
                data: audioData,
              },
            },
          },
        ],
        webhookUrl: webhookUrl,
        executionMode: "production",
      },
    ];

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "YOUR_API_KEY_HERE",
      },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get response audio as ArrayBuffer
    const audioArrayBuffer = await response.arrayBuffer();

    // Create blob from array buffer
    const botAudioBlob = new Blob([audioArrayBuffer], { type: "audio/mp3" });
    const botAudioUrl = URL.createObjectURL(botAudioBlob);

    // Add both user message and bot response to chat
    setMessages([
      ...messages,
      userMessage,
      {
        role: "bot",
        content: "🎤 Bot message",
        audioUrl: botAudioUrl,
        audioBlob: botAudioBlob,
      },
    ]);

    setLoading(false);
  } catch (error) {
    console.error("Error in voice interaction:", error);
    setMessages([
      ...messages,
      userMessage,
      { role: "bot", content: "Failed to process voice message" },
    ]);
    setLoading(false);
  }
}
