import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
  return new GoogleGenerativeAI(apiKey);
}

export interface GenerateContentOptions {
  keyword: string;
  writingStyle?: string;
  targetLanguage?: string;
  promptTemplate?: string;
}

export interface GeneratedContent {
  title: string;
  outline: string;
  htmlContent: string;
  seoMeta: {
    description: string;
    focusKeyword: string;
    tags: string[];
  };
}

const DEFAULT_PROMPT_TEMPLATE = `คุณคือนักเขียนบล็อก SEO มืออาชีพที่เชี่ยวชาญด้านเนื้อหาภาษาไทย
เขียนบทความสำหรับ Blogger.com ในรูปแบบ HTML ที่สมบูรณ์

ทำตามขั้นตอน RAG Workflow:
1. RESEARCH: วิเคราะห์คีย์เวิร์ดและหัวข้อที่เกี่ยวข้อง
2. OUTLINE: วางโครงสร้างบทความ
3. DRAFT: เขียนเนื้อหาร่างแรก
4. SEO OPTIMIZATION: ปรับแต่ง SEO
5. FINAL HTML: แปลงเป็น HTML สำหรับ Blogger

สไตล์การเขียน: {writingStyle}
ภาษาหลัก: {targetLanguage}`;

export async function generateBlogContent(
  options: GenerateContentOptions
): Promise<GeneratedContent> {
  const {
    keyword,
    writingStyle = "informative",
    targetLanguage = "th",
    promptTemplate = DEFAULT_PROMPT_TEMPLATE,
  } = options;

  const systemPrompt = promptTemplate
    .replace("{writingStyle}", writingStyle)
    .replace("{targetLanguage}", targetLanguage === "th" ? "ภาษาไทย" : "English");

  const userMessage = `${systemPrompt}

สร้างบทความ SEO คุณภาพสูงสำหรับคีย์เวิร์ด: "${keyword}"

กรุณาตอบในรูปแบบ JSON ดังนี้ (ตอบเฉพาะ JSON เท่านั้น ไม่ต้องมี markdown code block):
{
  "title": "หัวข้อบทความ",
  "outline": "โครงสร้างบทความ (markdown)",
  "htmlContent": "เนื้อหา HTML ครบสมบูรณ์สำหรับ Blogger",
  "seoMeta": {
    "description": "Meta description (150-160 ตัวอักษร)",
    "focusKeyword": "คีย์เวิร์ดหลัก",
    "tags": ["tag1", "tag2", "tag3"]
  }
}

เนื้อหา HTML ควรมี:
- <h2> และ <h3> สำหรับโครงสร้าง
- <p> สำหรับย่อหน้า
- <ul>/<ol> สำหรับรายการ
- ความยาวไม่น้อยกว่า 1,500 คำ
- ใช้คีย์เวิร์ดอย่างเป็นธรรมชาติ`;

  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(userMessage);
  const text = result.response.text();

  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Gemini did not return valid JSON");

  return JSON.parse(jsonMatch[0]) as GeneratedContent;
}

export async function generateOutlineOnly(keyword: string): Promise<string> {
  const genAI = getClient();
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(
    `สร้างโครงสร้างบทความ (outline) สำหรับคีย์เวิร์ด: "${keyword}"\nตอบเป็น markdown เท่านั้น`
  );
  return result.response.text();
}
