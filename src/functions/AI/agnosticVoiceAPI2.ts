import { Message } from "../../types/message";

interface APIPayload {
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
      sessionId: string;
      update_id: string;
      message: {
        message_id: string;
        from: {
          id: string;
          is_bot: boolean;
          first_name: string;
          username: string;
          language_code: string;
        };
        chat: {
          id: string;
          first_name: string;
          username: string;
          type: string;
        };
        date: number;
        chatInput: string;
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
  userInput: string,
  lang: string,
  userMessage: Message,
  audioData: string
) {
  setLoading(true);

  try {
    const webhookUrl =
      "https://n8n.ecobetug.com/webhook/bf4dd093-bb02-472c-9454-7ab9af97bd1d";

    // Fix the payload structure - it should be an object, not an array
    const payload: APIPayload = {
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
          sessionId: userId,
          update_id: Math.floor(Math.random() * 1000000).toString(),
          message: {
            message_id: Math.floor(Math.random() * 1000000).toString(),
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
            voice: {
              file_name: userMessage.audioUrl || "",
              mime_type: "audio/webm", // Updated to match recording format
              data: audioData,
            },
          },
        },
      ],
      webhookUrl: webhookUrl,
      executionMode: "production",
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "YOUR_API_KEY_HERE",
      },
      body: JSON.stringify(payload),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if the response is actually audio
    const contentType = response.headers.get("content-type");
    console.log("Response content-type:", contentType);

    if (contentType && contentType.includes("audio")) {
      // Handle audio response
      const audioArrayBuffer = await response.arrayBuffer();

      if (audioArrayBuffer.byteLength === 0) {
        throw new Error("Empty audio response");
      }

      const botAudioBlob = new Blob([audioArrayBuffer], {
        type: contentType || "audio/mpeg",
      });
      const botAudioUrl = URL.createObjectURL(botAudioBlob);

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
    } else {
      // Handle text/JSON response
      const responseText = await response.text();
      console.log("Response text:", responseText);

      let botMessage = "🎤 Bot response received";
      try {
        const jsonResponse = JSON.parse(responseText);
        if (jsonResponse.message) {
          botMessage = jsonResponse.message;
        }
      } catch (e) {
        // If not JSON, use the text directly
        if (responseText.trim()) {
          botMessage = responseText;
        }
      }

      setMessages([
        ...messages,
        userMessage,
        {
          role: "bot",
          content: botMessage,
        },
      ]);
    }

    setLoading(false);
  } catch (error) {
    console.error("Error in voice interaction:", error);
    setMessages([
      ...messages,
      userMessage,
      {
        role: "bot",
        content: `Failed to process voice message: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
    ]);
    setLoading(false);
  }
}

// Additional utility function for better audio blob handling
export function createSafeAudioBlob(
  data: BufferSource | Blob | string,
  mimeType: string = "audio/mpeg"
): { blob: Blob; url: string } {
  try {
    // Ensure we have valid data
    if (!data || (data instanceof ArrayBuffer && data.byteLength === 0)) {
      throw new Error("No audio data provided");
    }

    // Create blob with proper headers for audio playback
    const blob = new Blob([data], {
      type: mimeType,
    });

    if (blob.size === 0) {
      throw new Error("Created blob is empty");
    }

    const url = URL.createObjectURL(blob);

    return { blob, url };
  } catch (error) {
    console.error("Error creating audio blob:", error);
    throw error;
  }
}
