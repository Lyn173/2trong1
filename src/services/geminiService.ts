import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface VideoAnalysisResult {
  description: string;
}

export async function analyzeAndMimicStyle(
  styleVideoBase64: string,
  targetVideoBase64: string,
  extraInfo: string
): Promise<string> {
  const model = "gemini-2.5-flash-preview-tts"; // Using a model that supports multimodal. Actually gemini-3-flash-preview is better for reasoning.
  // Wait, gemini-2.5-flash-preview-tts is for TTS. 
  // Let's use gemini-3-flash-preview as per instructions for basic/complex tasks.
  
  const prompt = `
    Bạn là một chuyên gia sáng tạo nội dung bất động sản trên mạng xã hội (TikTok, Facebook, Reels).
    Nhiệm vụ của bạn gồm 2 bước:
    1. Phân tích phong cách của Video 1 (Video viral): Chú ý đến giọng điệu, cách dùng từ, sự hài hước, các cụm từ bắt trend và cấu trúc bài đăng.
    2. Viết mô tả cho Video 2 (Video mục tiêu): 
       - Phải bám sát thứ tự các cảnh quay trong Video 2.
       - Sử dụng phong cách, ngôn ngữ và sự hài hước đã phân tích từ Video 1.
       - Lồng ghép các thông tin bổ sung sau đây một cách tự nhiên: ${extraInfo}
       - Mở đầu bằng lời chào thân thiện, hài hước (ví dụ: "Hello các vợ yêu", "Chào các tình yêu của em",...). Tránh lặp lại nội dung cũ.
       - Ngôn ngữ: Hoàn toàn bằng tiếng Việt.
       - Cuối bài viết thêm dòng: "Bản quyền thuộc về Thùy Ngân".
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "video/mp4", data: styleVideoBase64 } },
        { inlineData: { mimeType: "video/mp4", data: targetVideoBase64 } }
      ]
    }
  });

  return response.text || "Không thể tạo mô tả.";
}

export async function generateViralDescription(
  videoBase64: string,
  extraInfo: string
): Promise<string> {
  const prompt = `
    Bạn là một chuyên gia viết caption TikTok viral cho bất động sản.
    Nhiệm vụ:
    1. Xem video và viết một mô tả chân thực, chính xác những gì diễn ra trong video.
    2. Làm nổi bật các ưu điểm của căn phòng/ngôi nhà.
    3. Sử dụng các ý tưởng từ TikTok hoặc các cụm từ viral trên mạng xã hội để thu hút người xem.
    4. Lồng ghép các thông tin bổ sung sau đây một cách khéo léo: ${extraInfo}
    5. Mở đầu bằng lời chào tự nhiên, hài hước và biến tấu linh hoạt (ví dụ: "Hế lô các cục cưng", "Chào các người đẹp của tui",...). Đừng để bị đánh dấu là spam.
    6. Ngôn ngữ: Hoàn toàn bằng tiếng Việt.
    7. Cuối bài viết thêm dòng: "Bản quyền thuộc về Thùy Ngân".
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "video/mp4", data: videoBase64 } }
      ]
    }
  });

  return response.text || "Không thể tạo mô tả.";
}
