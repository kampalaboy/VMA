import { useEffect, useRef, useState } from "react";

interface STTHookReturn {
  isRecording: boolean;
  error: string | null;
  startSTT: () => Promise<void>;
  stopSTT: () => Promise<{ audioUrl: string; audioData: string }>;
  audioUrl: string | null;
  audioData: string | null;
}

function useSTT(): STTHookReturn {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioData, setAudioData] = useState<string | null>(null); // <== added

  const audioChunks = useRef<Blob[]>([]);

  const audioElements = useRef<{ [key: string]: HTMLAudioElement }>({});

  const [isWebviewEnvironment, setIsWebviewEnvironment] = useState(false);

  const isWebview = () => {
    const userAgent = navigator.userAgent;
    return (
      userAgent.includes("wv") || // Android WebView
      (userAgent.includes("Version/") && userAgent.includes("Mobile/")) // iOS UIWebView
      //window.navigator.standalone === false // iOS WKWebView
    );
  };

  useEffect(() => {
    setIsWebviewEnvironment(isWebview());
  }, []);

  function preloadAudio(src: string) {
    const audio = new Audio();
    audio.src = src;
    audio.preload = "auto";
    audioElements.current[src] = audio;

    // Return a promise that resolves when the audio is loaded
    return new Promise((resolve, reject) => {
      audio.oncanplaythrough = resolve;
      audio.onerror = reject;
    });
  }

  // Preload audio files when the hook is initialized
  useEffect(() => {
    const loadAudios = async () => {
      try {
        await Promise.all([
          preloadAudio("assets/notify/stopsttandsend.mp3"),
          preloadAudio("assets/notify/startstt.wav"),
        ]);
      } catch (error) {
        console.error("Failed to preload audio files:", error);
      }
    };

    loadAudios();
  }, []);

  const playNotification = async (src: string) => {
    try {
      const audio = audioElements.current[src];
      if (!audio) {
        throw new Error(`Audio not preloaded: ${src}`);
      }

      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error("Failed to play notification:", error);
    }
  };

  const startSTT = async () => {
    if (isWebviewEnvironment) {
      // More thorough checks for webview
      if (!window.MediaRecorder) {
        setError("Recording not supported in this app environment");
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Microphone access not available in this app");
        return;
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunks.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.start();

      setIsRecording(true);
      await playNotification("assets/notify/startstt.wav");

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to start recording"
      );
    }
  };

  const stopSTT = async (): Promise<{
    audioUrl: string;
    audioData: string;
  }> => {
    return new Promise((resolve, reject) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
          // Ensure we have audio data
          if (audioChunks.current.length === 0) {
            reject(new Error("No audio data recorded"));
            return;
          }

          try {
            // Create blob with proper MIME type
            const audioBlob = new Blob(audioChunks.current, {
              type: "audio/mp3", // Changed from audio/mp3 for better compatibility
            });

            // Verify blob size
            if (audioBlob.size === 0) {
              reject(new Error("Empty audio blob created"));
              return;
            }

            // Create URL with error handling
            const url = URL.createObjectURL(audioBlob);
            if (!url) {
              reject(new Error("Failed to create blob URL"));
              return;
            }

            setAudioUrl(url);
            setIsRecording(false);

            // Convert to Base64 with proper error handling
            const reader = new FileReader();
            reader.onloadend = () => {
              if (!reader.result) {
                reject(new Error("Failed to read audio data"));
                return;
              }
              const result = reader.result as string;
              const base64 = result.split(",")[1];
              setAudioData(base64);
              resolve({ audioUrl: url, audioData: base64 });
            };
            reader.onerror = (error) => {
              reject(new Error(`Failed to convert audio to base64: ${error}`));
            };
            reader.readAsDataURL(audioBlob);
          } catch (error) {
            reject(new Error(`Failed to process audio: ${error}`));
          }
        };

        // Stop recording and cleanup
        try {
          mediaRecorderRef.current.stop();
          playNotification("assets/notify/stopsttandsend.mp3");
          mediaRecorderRef.current.stream
            .getTracks()
            .forEach((track) => track.stop());
        } catch (error) {
          reject(new Error(`Failed to stop recording: ${error}`));
        }
      } else {
        reject(new Error("No recording in progress"));
      }
    });
  };

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return {
    isRecording,
    error,
    startSTT,
    stopSTT,
    audioUrl,
    audioData,
  };
}

export default useSTT;
