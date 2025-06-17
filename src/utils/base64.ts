export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix
      const base64Data = base64String.split(",")[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export function base64toBlob(
  base64Data: unknown,
  contentType: string = ""
): Blob {
  try {
    // Type checking and conversion
    if (!base64Data) {
      throw new Error("No data provided");
    }

    // Convert to string if needed
    let base64String: string;
    if (base64Data instanceof ArrayBuffer) {
      // Handle ArrayBuffer
      base64String = Buffer.from(base64Data).toString("base64");
    } else if (typeof base64Data === "object") {
      // Handle object (like Uint8Array)
      base64String = JSON.stringify(base64Data);
    } else if (typeof base64Data !== "string") {
      throw new Error(`Unsupported data type: ${typeof base64Data}`);
    } else {
      base64String = base64Data;
    }

    // Clean the base64 string
    const base64Clean = base64String.replace(/^data:.*,/, "");

    // Decode base64
    const binaryStr = atob(base64Clean);
    const bytes = new Uint8Array(binaryStr.length);

    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    // Create and verify blob
    const blob = new Blob([bytes], { type: contentType });
    if (blob.size === 0) {
      throw new Error("Created blob is empty");
    }

    return blob;
  } catch (error) {
    console.error("Base64 conversion error:", error);
    console.log("Input data type:", typeof base64Data);
    if (typeof base64Data === "string") {
      console.log("Data preview:", base64Data.substring(0, 100));
    }
    throw error;
  }
}
