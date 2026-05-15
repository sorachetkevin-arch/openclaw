import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface GenerateContentOptions {
  keyword: string;
  writingStyle?: string;
  targetLanguage?: string;
  promptTemplate?: string;
  researchUrls?: string[];
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

  const userMessage = `สร้างบทความ SEO คุณภาพสูงสำหรับคีย์เวิร์ด: "${keyword}"

กรุณาตอบในรูปแบบ JSON ดังนี้ (ตอบเฉพาะ JSON เท่านั้น):
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

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 8096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude did not return valid JSON");
  }

  return JSON.parse(jsonMatch[0]) as GeneratedContent;
}

export async function generateOutlineOnly(keyword: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `สร้างโครงสร้างบทความ (outline) สำหรับคีย์เวิร์ด: "${keyword}"\nตอบเป็น markdown เท่านั้น`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
