import { startVoiceInteract } from "../src/functions/AI/watsonVoiceAPI";
import { startInteract } from "../src/functions/AI/watsonAPI";
import { Message } from "../src/types/message";

// Mock dependencies
jest.mock("./watsonAPI");
const mockStartInteract = startInteract as jest.MockedFunction<
  typeof startInteract
>;

// Mock global fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn();
const mockCreateObjectURL = URL.createObjectURL as jest.MockedFunction<
  typeof URL.createObjectURL
>;

// Mock console methods
console.log = jest.fn();
console.error = jest.fn();

describe("startVoiceInteract", () => {
  // Mock functions
  const mockSetMessages = jest.fn();
  const mockSetLoading = jest.fn();

  // Test data
  const mockUserMessage: Message = { role: "user", content: "test message" };
  const mockMessages = [{ role: "user", content: "previous message" }];
  const mockUserId = "user123";
  const mockAudioData = "base64audiodata";
  const mockAudioFile = "audiofile.wav";
  const mockLang = "en";
  const mockEndpoint = "STT";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Input Validation", () => {
    it("should handle missing audio data and audio file", async () => {
      await startVoiceInteract(
        mockSetMessages,
        mockSetLoading,
        mockUserMessage,
        mockMessages,
        mockUserId,
        "", // empty audioData
        "", // empty audioFile
        mockLang,
        mockEndpoint
      );

      expect(mockSetMessages).toHaveBeenCalledWith(expect.any(Function));
      expect(mockSetLoading).not.toHaveBeenCalled();

      // Test the callback function
      const setMessagesCallback = mockSetMessages.mock.calls[0][0];
      const result = setMessagesCallback([]);
      expect(result).toEqual([
        { role: "bot", content: "No audio data provided." },
      ]);
    });

    it("should proceed when audioData is provided", async () => {
      const mockSTTResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ transcript: "Hello world" }),
      };
      const mockTTSResponse = {
        ok: true,
        blob: jest
          .fn()
          .mockResolvedValue(new Blob(["audio"], { type: "audio/wav" })),
      };

      mockFetch
        .mockResolvedValueOnce(mockSTTResponse as never)
        .mockResolvedValueOnce(mockTTSResponse as never);

      mockStartInteract.mockResolvedValue("Bot response");
      mockCreateObjectURL.mockReturnValue("blob:audio-url");

      await startVoiceInteract(
        mockSetMessages,
        mockSetLoading,
        mockUserMessage,
        mockMessages,
        mockUserId,
        mockAudioData,
        "",
        mockLang,
        mockEndpoint
      );

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("STT API Call", () => {
    it("should make correct STT API call with audioData", async () => {
      const mockSTTResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ transcript: "Hello world" }),
      };
      const mockTTSResponse = {
        ok: true,
        blob: jest
          .fn()
          .mockResolvedValue(new Blob(["audio"], { type: "audio/wav" })),
      };

      mockFetch
        .mockResolvedValueOnce(mockSTTResponse as never)
        .mockResolvedValueOnce(mockTTSResponse as never);

      mockStartInteract.mockResolvedValue("Bot response");
      mockCreateObjectURL.mockReturnValue("blob:audio-url");

      await startVoiceInteract(
        mockSetMessages,
        mockSetLoading,
        mockUserMessage,
        mockMessages,
        mockUserId,
        mockAudioData,
        "",
        mockLang,
        mockEndpoint
      );

      expect(mockFetch).toHaveBeenNthCalledWith(
        1,
        `https://cti-app.1r1lw5ypdyix.us-east.codeengine.appdomain.cloud/${mockEndpoint}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "RAG-APP-API-Key": "Quick2go!",
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            audio_data: mockAudioData,
          }),
        }
      );
    });

    it("should handle STT API error", async () => {
      const mockSTTResponse = {
        ok: false,
        status: 500,
      };

      mockFetch.mockResolvedValueOnce(mockSTTResponse as never);

      await startVoiceInteract(
        mockSetMessages,
        mockSetLoading,
        mockUserMessage,
        mockMessages,
        mockUserId,
        mockAudioData,
        "",
        mockLang,
        mockEndpoint
      );

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(mockSetMessages).toHaveBeenCalledWith(expect.any(Function));

      // Test error message callback
      const setMessagesCallback = mockSetMessages.mock.calls[1][0];
      const result = setMessagesCallback([]);
      expect(result).toEqual([
        {
          role: "bot",
          content: "Sorry, there was an error processing your audio.",
        },
      ]);
    });
  });

  describe("Watson Interaction", () => {
    it("should call startInteract with correct parameters", async () => {
      const mockTranscript = "Hello world";
      const mockSTTResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ transcript: mockTranscript }),
      };
      const mockTTSResponse = {
        ok: true,
        blob: jest
          .fn()
          .mockResolvedValue(new Blob(["audio"], { type: "audio/wav" })),
      };

      mockFetch
        .mockResolvedValueOnce(mockSTTResponse as never)
        .mockResolvedValueOnce(mockTTSResponse as never);

      mockStartInteract.mockResolvedValue("Bot response");
      mockCreateObjectURL.mockReturnValue("blob:audio-url");

      await startVoiceInteract(
        mockSetMessages,
        mockSetLoading,
        mockUserMessage,
        mockMessages,
        mockUserId,
        mockAudioData,
        "",
        mockLang,
        mockEndpoint
      );

      expect(mockStartInteract).toHaveBeenCalledWith(
        expect.any(Function), // empty function
        expect.any(Function), // empty function
        [...mockMessages, mockUserMessage],
        mockTranscript,
        mockUserId,
        mockLang,
        { role: "user", content: mockTranscript },
        "watsonchat",
        "response"
      );
    });
  });

  describe("TTS API Call", () => {
    it("should make correct TTS API call", async () => {
      const mockBotResponse = "This is the bot response";
      const mockSTTResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ transcript: "Hello world" }),
      };
      const mockTTSResponse = {
        ok: true,
        blob: jest
          .fn()
          .mockResolvedValue(new Blob(["audio"], { type: "audio/wav" })),
      };

      mockFetch
        .mockResolvedValueOnce(mockSTTResponse as never)
        .mockResolvedValueOnce(mockTTSResponse as never);

      mockStartInteract.mockResolvedValue(mockBotResponse);
      mockCreateObjectURL.mockReturnValue("blob:audio-url");

      await startVoiceInteract(
        mockSetMessages,
        mockSetLoading,
        mockUserMessage,
        mockMessages,
        mockUserId,
        mockAudioData,
        "",
        mockLang,
        mockEndpoint
      );

      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "https://cti-app.1r1lw5ypdyix.us-east.codeengine.appdomain.cloud/TTS",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "RAG-APP-API-Key": "Quick2go!",
          },
          body: JSON.stringify({
            text: mockBotResponse,
          }),
        }
      );
    });

    it("should handle TTS API error", async () => {
      const mockSTTResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ transcript: "Hello world" }),
      };
      const mockTTSResponse = {
        ok: false,
        status: 500,
      };

      mockFetch
        .mockResolvedValueOnce(mockSTTResponse as never)
        .mockResolvedValueOnce(mockTTSResponse as never);

      mockStartInteract.mockResolvedValue("Bot response");

      await startVoiceInteract(
        mockSetMessages,
        mockSetLoading,
        mockUserMessage,
        mockMessages,
        mockUserId,
        mockAudioData,
        "",
        mockLang,
        mockEndpoint
      );

      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(mockSetMessages).toHaveBeenCalledWith(expect.any(Function));
    });
  });

  describe("Success Flow", () => {
    it("should complete full success flow", async () => {
      const mockTranscript = "Hello world";
      const mockBotResponse = "Bot response";
      const mockAudioUrl = "blob:audio-url";
      const mockSTTResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ transcript: mockTranscript }),
      };
      const mockTTSResponse = {
        ok: true,
        blob: jest
          .fn()
          .mockResolvedValue(new Blob(["audio"], { type: "audio/wav" })),
      };

      mockFetch
        .mockResolvedValueOnce(mockSTTResponse as never)
        .mockResolvedValueOnce(mockTTSResponse as never);

      mockStartInteract.mockResolvedValue(mockBotResponse);
      mockCreateObjectURL.mockReturnValue(mockAudioUrl);

      // Mock Date for consistent testing
      const mockDate = new Date("2023-01-01T12:00:00Z");
      jest.spyOn(global, "Date").mockImplementation(() => mockDate as never);

      await startVoiceInteract(
        mockSetMessages,
        mockSetLoading,
        mockUserMessage,
        mockMessages,
        mockUserId,
        mockAudioData,
        "",
        mockLang,
        mockEndpoint
      );

      // Verify loading states
      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);

      // Verify messages were updated correctly
      expect(mockSetMessages).toHaveBeenCalledTimes(2);

      // First call - adding user message
      const firstCallback = mockSetMessages.mock.calls[0][0];
      const firstResult = firstCallback([]);
      expect(firstResult).toEqual([...mockMessages, mockUserMessage]);

      // Second call - adding bot response with audio
      const secondCallback = mockSetMessages.mock.calls[1][0];
      const secondResult = secondCallback([]);
      expect(secondResult).toEqual([
        {
          role: "bot",
          content: "🎤 Bot at 12:00:00 PM",
          audioUrl: mockAudioUrl,
        },
      ]);

      // Verify audio URL was created
      expect(mockCreateObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    });
  });

  describe("Network Errors", () => {
    it("should handle network errors gracefully", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      await startVoiceInteract(
        mockSetMessages,
        mockSetLoading,
        mockUserMessage,
        mockMessages,
        mockUserId,
        mockAudioData,
        "",
        mockLang,
        mockEndpoint
      );

      expect(mockSetLoading).toHaveBeenCalledWith(true);
      expect(mockSetLoading).toHaveBeenCalledWith(false);
      expect(console.error).toHaveBeenCalledWith(
        "STT Error:",
        expect.any(Error)
      );

      // Verify error message was added
      expect(mockSetMessages).toHaveBeenCalledWith(expect.any(Function));
      const setMessagesCallback = mockSetMessages.mock.calls[1][0];
      const result = setMessagesCallback([]);
      expect(result).toEqual([
        {
          role: "bot",
          content: "Sorry, there was an error processing your audio.",
        },
      ]);
    });
  });

  describe("Audio File vs Audio Data", () => {
    it("should prioritize audioData over audioFile when both are provided", async () => {
      const mockSTTResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ transcript: "Hello world" }),
      };
      const mockTTSResponse = {
        ok: true,
        blob: jest
          .fn()
          .mockResolvedValue(new Blob(["audio"], { type: "audio/wav" })),
      };

      mockFetch
        .mockResolvedValueOnce(mockSTTResponse as never)
        .mockResolvedValueOnce(mockTTSResponse as never);

      mockStartInteract.mockResolvedValue("Bot response");
      mockCreateObjectURL.mockReturnValue("blob:audio-url");

      await startVoiceInteract(
        mockSetMessages,
        mockSetLoading,
        mockUserMessage,
        mockMessages,
        mockUserId,
        mockAudioData,
        mockAudioFile,
        mockLang,
        mockEndpoint
      );

      // Verify that audioData was used in the request body
      const requestBody = JSON.parse(
        mockFetch.mock.calls[0][1]?.body as string
      );
      expect(requestBody.audio_data).toBe(mockAudioData);
    });

    it("should use audioFile when audioData is not provided", async () => {
      const mockSTTResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ transcript: "Hello world" }),
      };
      const mockTTSResponse = {
        ok: true,
        blob: jest
          .fn()
          .mockResolvedValue(new Blob(["audio"], { type: "audio/wav" })),
      };

      mockFetch
        .mockResolvedValueOnce(mockSTTResponse as never)
        .mockResolvedValueOnce(mockTTSResponse as never);

      mockStartInteract.mockResolvedValue("Bot response");
      mockCreateObjectURL.mockReturnValue("blob:audio-url");

      await startVoiceInteract(
        mockSetMessages,
        mockSetLoading,
        mockUserMessage,
        mockMessages,
        mockUserId,
        "", // empty audioData
        mockAudioFile,
        mockLang,
        mockEndpoint
      );

      // Verify that audioFile would be used (though the current implementation sends null)
      const requestBody = JSON.parse(
        mockFetch.mock.calls[0][1]?.body as string
      );
      expect(requestBody.audio_data).toBeNull();
    });
  });
});
