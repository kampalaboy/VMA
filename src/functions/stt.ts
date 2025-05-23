import { useEffect, useRef, useState } from "react";

interface STTHookReturn {
  isRecording: boolean;
  error: string | null;
  startSTT: () => Promise<void>;
  stopSTT: () => Promise<string>;
  audioUrl: string | null;
}

function useSTT(): STTHookReturn {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const audioElements = useRef<{ [key: string]: HTMLAudioElement }>({});

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

  const stopSTT = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, {
            type: "audio/wav",
          });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);
          setIsRecording(false);
          resolve(url);
        };
        mediaRecorderRef.current.stop();
        playNotification("assets/notify/stopsttandsend.mp3");

        mediaRecorderRef.current.stream
          .getTracks()
          .forEach((track) => track.stop());
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
  };
}

export default useSTT;
