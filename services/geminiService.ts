
import { GoogleGenAI, Type } from "@google/genai";
import { BlogInfo, BlogType, PhotoData, GeneratedBlog } from "../types";

export const generateBlogPost = async (
  info: BlogInfo,
  photos: PhotoData[]
): Promise<GeneratedBlog> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isRestaurant = info.type === BlogType.RESTAURANT;
  
  const persona = isRestaurant 
    ? "대한민국 최고의 맛집 전문 블로거" 
    : `대한민국 최고의 파워 블로거 (분야: ${info.category || '일상/리뷰'})`;

  const contextInfo = isRestaurant
    ? `식당 정보(이름: ${info.name}, 위치: ${info.location}, 메뉴: ${info.mainMenu})`
    : `주제 정보(제목/주제: ${info.subject}, 카테고리: ${info.category})`;

  const prompt = `
    당신은 ${persona}입니다. 
    ${info.writingStyle ? `[특별 지시: 다음은 사용자의 실제 블로그 말투 샘플입니다. 
    ⚠️ 절대 주의: 이 샘플 텍스트에 등장하는 특정 장소(예: 바다), 상황, 인물, 고유명사, 과거의 경험 등 구체적인 '내용(Content)'은 절대 현재 작성할 포스팅에 복사하거나 억지로 끼워넣지 마세요.
    오직 사용자가 글을 전개하는 방식, 문장의 길이, 끝맺음(어미, 예: ~다!, ~해요 등), 감탄사, 이모지 사용 스타일, 감정 표현의 강도 등 순수한 '문체와 톤앤매너(Style/Tone)'만을 추출하여 현재 주제에 자연스럽게 적용하세요.
    말투 샘플: "${info.writingStyle}"]` : ''}
    
    제공된 사진들과 ${contextInfo}, 분위기: ${info.mood}, 참고사항: ${info.specialNotes}를 바탕으로 네이버 블로그 스타일의 정성스러운 포스팅을 작성하세요.

    [실시간 검색 활용 지침]
    - 구글 검색 도구를 사용하여 관련 최신 정보(정확한 위치, 제품 스펙, 최신 트렌드, 방문자 반응 등)를 확인하고 글에 반영하세요.
    - 검색된 정보와 사용자가 제공한 정보를 조합하여 신뢰도 높은 포스팅을 만드세요.

    [작성 가이드라인]
    1. 말투: ${info.writingStyle ? '위 [특별 지시]에서 분석한 사용자의 문체와 톤앤매너(어미, 리듬, 표현력)를 적용하되, 샘플의 구체적인 내용은 절대 재사용하지 말고 오직 현재의 사진과 정보에만 집중하세요.' : '친근하면서도 전문성이 느껴지는 해요체와 적절한 이모지 사용.'}
    2. 구성: 매력적인 제목(title), 소제목(subtitle), 생생한 경험담(text), 사진에 대한 상세 설명(image), 총평(summary).
    3. 사진 설명: 각 사진(image) 섹션은 제공된 사진 리스트의 인덱(imageIndex)와 매칭되어야 합니다.
    4. 금지 사항: 마크다운 기호(#, *, - 등) 사용 금지. 순수 텍스트로만 작성.
    5. 태그: 관련 해시태그 5~10개 생성.

    반드시 JSON 형식으로만 응답하세요.
  `;

  const imageParts = photos.map(photo => ({
    inlineData: {
      data: photo.base64.split(',')[1],
      mimeType: 'image/jpeg',
    },
  }));

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          ...imageParts,
          { text: "반드시 JSON 형식으로 응답하며, 모든 섹션의 type은 'text', 'image', 'subtitle', 'summary' 중 하나여야 합니다." }
        ]
      },
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ['text', 'image', 'subtitle', 'summary'] },
                  content: { type: Type.STRING },
                  imageIndex: { type: Type.NUMBER }
                },
                required: ['type', 'content']
              }
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['title', 'sections', 'tags']
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as GeneratedBlog;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("블로그 생성 중 오류가 발생했습니다.");
  }
};
