import { useState, useCallback, useEffect, useRef } from "react";

interface TranscriptMessage {
  type: "final" | "interim" | "error" | "status";
  text?: string;
  error?: string;
  status?: string;
}
const useSTT = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    // Stop media recorder
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }

    // Stop all audio tracks
    streamRef.current?.getTracks().forEach((track) => track.stop());

    // Close WebSocket connection
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    // Clear refs
    mediaRecorderRef.current = null;
    streamRef.current = null;
    socketRef.current = null;
  }, []);

  const connectWebSocket = useCallback(() => {
    if (window["WebSocket"]) {
      try {
        socketRef.current = new WebSocket("http://localhost:4050/stt");

        socketRef.current.onopen = () => {
          console.log("WSS!");
        };
        socketRef.current.onmessage = (event: MessageEvent) => {
          try {
            const data: TranscriptMessage = JSON.parse(event.data);

            switch (data.type) {
              case "final":
                setTranscript((prev) => `${prev} ${data.text}`.trim());
                break;
              case "interim":
                // Handle interim results if needed
                break;
              case "error":
                setError(data.error || "Unknown error occurred");
                break;
              case "status":
                console.log("STT Status:", data.status);
                break;
            }
          } catch (e) {
            setError(`Failed to parse message: ${e}`);
          }
        };

        socketRef.current.onerror = (event: Event) => {
          setError(`WebSocket error occurred:${event}`);
          setIsRecording(false);
        };

        socketRef.current.onclose = () => {
          setIsRecording(false);
        };
      } catch (e) {
        setError(`Failed to connect to WebSocket: ${e}`);
        setIsRecording(false);
      }
    } else {
      alert("No web socket support");
    }
  }, []);

  const stopRecording = useCallback(() => {
    cleanup();
    setIsRecording(false);
  }, [cleanup]);

  const startRecording = useCallback(async () => {
    try {
      // Reset states
      setError(null);
      setTranscript("");

      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Connect WebSocket
      connectWebSocket();

      // Setup MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      recorder.ondataavailable = (event: BlobEvent) => {
        if (
          event.data.size > 0 &&
          socketRef.current?.readyState === WebSocket.OPEN
        ) {
          socketRef.current.send(event.data);
        }
      };

      recorder.onerror = (event: Event) => {
        setError(`WebSocket error occurred:${event}`);
        stopRecording();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(250); // Send chunks every 250ms
      setIsRecording(true);
    } catch (e) {
      setError(`Failed to start recording: ${e}`);
      cleanup();
    }
  }, [connectWebSocket, stopRecording, cleanup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isRecording,
    transcript,
    error,
    startRecording,
    stopRecording,
  };
};
export default useSTT;
