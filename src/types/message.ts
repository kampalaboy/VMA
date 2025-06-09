export interface Message {
  role: string;
  content: string;
  audioUrl?: string;
  audioBlob?: Blob;
  audioFileName?: string;
}
