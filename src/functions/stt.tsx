// stt.ts - Speech to Text hook that connects to FastAPI WebSocket

import { useState, useEffect, useRef, useCallback } from "react";

export interface UseSpeechToTextResult {
  transcript: string;
  isRecording: boolean;
  isConnected: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  error: string | null;
}

export const useSpeechToText = (
  serverUrl: string = "ws://localhost:8080/stt"
): UseSpeechToTextResult => {
  const [transcript, setTranscript] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // WebSocket ref to maintain the connection
  const socketRef = useRef<WebSocket | null>(null);

  // Track audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Connect to WebSocket server
  useEffect(() => {
    // Initialize connection
    const socket = new WebSocket(serverUrl);

    socket.onopen = () => {
      console.log("WebSocket connection established");
      setIsConnected(true);
      setError(null);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle transcription data from server
        if (data.type === "transcription") {
          // Update transcript based on the received data
          // Adjust this based on the exact structure of your data

          if (data.data && Array.isArray(data.data)) {
            // If it's an array of alternatives
            const results = data.data;
            if (
              results.length > 0 &&
              results[0].alternatives &&
              results[0].alternatives.length > 0
            ) {
              const newText = results[0].alternatives[0].transcript || "";

              // Update transcript if not empty
              if (newText.trim()) {
                setTranscript((prev) => {
                  // For final results, append to existing transcript
                  if (results[0].final) {
                    return prev + " " + newText;
                  }
                  // For interim results, replace the current transcript
                  return newText;
                });
              }
            }
          }
        }
      } catch (err) {
        console.error("Error processing message:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
      setError("WebSocket connection error");
      setIsConnected(false);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [serverUrl]);

  // Start recording function
  const startRecording = useCallback(async () => {
    try {
      // Reset the transcript when starting a new recording
      setTranscript("");

      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Browser does not support audio recording");
      }

      // Get audio stream from user's microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available event
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);

          // Convert the audio data to format suitable for the server
          const audioBlob = new Blob([event.data], { type: "audio/wav" });

          // Send audio data to server if connected
          if (
            socketRef.current &&
            socketRef.current.readyState === WebSocket.OPEN
          ) {
            // Convert blob to array buffer to send over WebSocket
            const reader = new FileReader();
            reader.onload = () => {
              if (socketRef.current && reader.result) {
                socketRef.current.send(reader.result);
              }
            };
            reader.readAsArrayBuffer(audioBlob);
          }
        }
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError(
        err instanceof Error ? err.message : "Unknown error starting recording"
      );
    }
  }, []);

  // Stop recording function
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();

      // Stop all audio tracks
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }

      setIsRecording(false);

      // Optional: Process the complete audio recording
      // const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      // ... do something with the complete audio blob if needed
    }
  }, [isRecording]);

  return {
    transcript,
    isRecording,
    isConnected,
    startRecording,
    stopRecording,
    error,
  };
};
