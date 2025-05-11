import { useState } from "react";

interface STTResponse {
  message: string;
  transcript?: string;
  error?: string;
  debug_info?: {
    audio_received: boolean;
    interim_results_count: number;
    last_interim_results: string[];
    transcript_segments_count: number;
  };
}

const useSTT = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchWatsonSTT = async (endpoint: string): Promise<STTResponse> => {
    try {
      const res = await fetch(`http://localhost:4050/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("STT Error:", error);
      throw error;
    }
  };

  const startSTT = async () => {
    try {
      setError(null);
      const response = await fetchWatsonSTT("start_stt");
      if (response.message.includes("started successfully")) {
        setIsRecording(true);
        return true;
      }
      return false;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to start STT");
      return false;
    }
  };

  const stopSTT = async (): Promise<string> => {
    try {
      setError(null);
      const response = await fetchWatsonSTT("stop_stt");
      setIsRecording(false);

      if (response.transcript) {
        const data = response.transcript;
        setTranscript(data);
        return data;
      } else {
        throw new Error(response.message || "No transcript received");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to stop STT");
      setIsRecording(false);
      return "";
    }
  };

  return {
    isRecording,
    error,
    startSTT,
    stopSTT,
    transcript,
  };
};

export default useSTT;
