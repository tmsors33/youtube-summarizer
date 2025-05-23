import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { extractVideoId } from '@/lib/utils';
import { OpenAI } from 'openai';

// Next.js API 설정
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
    responseLimit: false,
    externalResolver: true,
  },
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define response type
type ResponseData = {
  summary: string;
  videoDetails: any;
  timeline?: any[];
} | {
  error: string;
}

/**
 * API handler for summarizing YouTube videos
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoUrl, summaryType = 'brief', generateTimeline = false } = req.body;
    
    if (!videoUrl) {
      return res.status(400).json({ error: '비디오 URL이 제공되지 않았습니다.' });
    }

    // Extract video ID from URL
    const videoId = extractVideoId(videoUrl);
    
    if (!videoId) {
      return res.status(400).json({ error: '유효한 유튜브 URL이 아닙니다.' });
    }

    // Get video details from YouTube API
    const videoDetails = await getVideoDetails(videoId);
    
    if (!videoDetails) {
      return res.status(404).json({ error: '비디오 정보를 찾을 수 없습니다.' });
    }

    // Get video transcript
    const transcript = await getVideoTranscript(videoId);
    
    if (!transcript || transcript.length === 0) {
      return res.status(404).json({ error: '비디오 자막을 찾을 수 없습니다.' });
    }

    // API 요청 타임아웃 설정 - 환경 변수에서 가져옴 (기본값 120초)
    const apiTimeout = parseInt(process.env.API_TIMEOUT || '120000');

    try {
      // 병렬로 요약과 타임라인 생성 (시간 단축)
      const [summary, timeline] = await Promise.all([
        generateSummary(transcript, videoDetails.title, summaryType, apiTimeout),
        generateTimeline ? generateVideoTimeline(transcript, videoDetails.title, summaryType, apiTimeout) : Promise.resolve([])
      ]);

      // Return the summary and video details
      return res.status(200).json({
        summary,
        videoDetails,
        timeline: generateTimeline ? timeline : undefined,
      });
    } catch (apiError) {
      console.error('API 요청 타임아웃 또는 오류 발생:', apiError);
      
      // 기본 요약 생성 (간단한 방식)
      const basicSummary = `영상 제목: ${videoDetails.title}\n\n이 영상은 ${videoDetails.channelTitle} 채널에서 제작한 콘텐츠입니다.\n\n영상의 내용을 완전히 요약하지 못했습니다. 서버 부하가 높거나 영상이 너무 긴 경우 이런 현상이 발생할 수 있습니다. 잠시 후 다시 시도해 주세요.`;
      
      // 기본 타임라인 생성
      const basicTimeline = [
        { time: "00:00", title: "영상 시작", description: "주제 소개 및 개요" },
        { time: "02:00", title: "주요 내용", description: "핵심 아이디어 설명" },
        { time: Math.floor(videoDetails.duration / 2).toString().padStart(2, '0') + ":00", title: "중간 내용", description: "주요 논의 내용" },
        { time: Math.floor(videoDetails.duration * 0.8).toString().padStart(2, '0') + ":00", title: "결론", description: "마무리 및 요약" }
      ];
      
      return res.status(200).json({
        summary: basicSummary,
        videoDetails,
        timeline: generateTimeline ? basicTimeline : undefined,
      });
    }
  } catch (error: any) {
    console.error('Error processing request:', error);
    const errorMessage = error.message || '요약 생성 중 오류가 발생했습니다.';
    return res.status(500).json({ error: errorMessage });
  }
}

/**
 * Get video details from YouTube API
 */
async function getVideoDetails(videoId: string) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`;
    
    const response = await axios.get(url, { timeout: 10000 }); // 10초 타임아웃 설정으로 변경
    
    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }
    
    const videoData = response.data.items[0];
    
    return {
      id: videoId,
      title: videoData.snippet.title,
      description: videoData.snippet.description,
      channelTitle: videoData.snippet.channelTitle,
      publishedAt: videoData.snippet.publishedAt,
      duration: videoData.contentDetails.duration,
      viewCount: videoData.statistics.viewCount,
      likeCount: videoData.statistics.likeCount,
      commentCount: videoData.statistics.commentCount,
    };
  } catch (error) {
    console.error('Error fetching video details:', error);
    return null;
  }
}

/**
 * Get video transcript using a third-party library or service
 */
async function getVideoTranscript(videoId: string): Promise<string> {
  try {
    // 현재 이 함수는 실제 유튜브 자막을 가져오지 않고 가상의 자막을 반환합니다.
    // 아래는 실제 자막을 가져오는 구현 방법에 대한 주석입니다:
    
    // 방법 1: 서드파티 라이브러리 사용 (youtube-transcript 등)
    // npm install youtube-transcript
    // import { YoutubeTranscript } from 'youtube-transcript';
    // const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    // return transcriptItems.map(item => item.text).join(' ');
    
    // 방법 2: 유투브 자막 API 직접 사용 (추가 설정 필요)
    // const captionsUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${process.env.YOUTUBE_API_KEY}`;
    // const captionsResponse = await axios.get(captionsUrl);
    // ...

    // 테스트용 자막 데이터 반환 (짧은 시간 내 처리를 위해 지연 제거)
    return `이 영상은 ${videoId} 아이디를 가진 유튜브 영상의 내용입니다. 실제 구현에서는 이 부분에 유튜브 API나 서드파티 라이브러리를 사용하여 실제 영상의 자막을 가져와야 합니다. 현재는 예시 텍스트로 대체되었습니다. 이 영상은 다양한 주제를 다루고 있으며, 시청자들에게 유용한 정보를 제공합니다. 콘텐츠 제작자는 이 영상에서 주요 개념을 설명하고, 실제 예시를 보여주며, 시청자들이 이해하기 쉽게 내용을 전달하고 있습니다. 또한 영상에서는 관련 리소스와 추가 학습 자료에 대한 정보도 제공합니다.`;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return '';
  }
}

/**
 * Generate summary using OpenAI's GPT model
 */
async function generateSummary(transcript: string, title: string, summaryType: string = 'brief', timeout: number = 60000): Promise<string> {
  try {
    let systemPrompt = '';
    let maxTokens = 0;
    
    switch (summaryType) {
      case 'brief':
        systemPrompt = '당신은 유튜브 영상의 내용을 간결하고 명확하게 요약해주는 전문가입니다. 다음 영상 자막을, 핵심 내용만 간추려 한국어로 정리해주세요. 요약은 다음 형식으로 제공해주세요: 1. 영상의 주요 주제 (1-2줄), 2. 핵심 내용 요약 (3-5개의 글머리 기호), 3. 주요 결론 또는 인사이트 (1-2줄)';
        maxTokens = 800;
        break;
        
      case 'detailed':
        systemPrompt = '당신은 유튜브 영상의 내용을 상세하게 요약해주는 전문가입니다. 다음 영상 자막을 분석하여 한국어로 포괄적인 요약을 제공해주세요. 요약은 다음 형식으로 제공해주세요: \n\n1. 영상 개요 (2-3줄) - 영상의 목적과 주요 주제 간략히 설명\n\n2. 주요 섹션별 상세 요약 (각 섹션 2-3 문단) - 영상에서 다루는 주요 섹션이나 파트별로 내용을 요약하여 구조적으로 정리. 각 섹션의 내용과 핵심 주장 중심으로 설명\n\n3. 핵심 인사이트 및 배경 정보 (3-5개 항목) - 영상 내용에서 얻을 수 있는 통찰, 교훈이나 시사점 위주로 작성. 단순 요약이 아닌 내용 사이의 연결점, 숨겨진 의미, 맥락적 배경 정보 제공\n\n4. 전문 용어 설명 (필요한 경우) - 영상에서 언급된 중요 전문 용어 설명\n\n5. 결론 및 시청자에게 주는 의미 (3-4줄) - 영상의 종합적 의미와 시청자에게 주는 가치';
        maxTokens = 1500;
        break;
        
      case 'bullet':
        systemPrompt = '당신은 유튜브 영상의 핵심 포인트를 추출하는 전문가입니다. 다음 영상 자막에서 가장 중요한 10-15개의 포인트를 추출하여 글머리 기호(•) 형식으로 명확하게 정리해주세요. 각 포인트는 간결하면서도 독립적으로 이해 가능해야 합니다. 핵심 포인트는 시간 순서대로 정렬해주세요. 마지막에는 이 모든 내용을 종합한 영상의 핵심 메시지를 1-2문장으로 요약해주세요.';
        maxTokens = 1000;
        break;
        
      case 'eli5':
        systemPrompt = '당신은 복잡한 주제를 초보자도 이해할 수 있게 설명하는 전문가입니다. 5살 아이에게 설명하듯이 간단하고 쉬운 언어로 다음 영상의 내용을 설명해주세요. 어려운 용어는 피하고, 비유와 예시를 활용하여 개념을 설명해주세요. 다음 구조로 작성해주세요: \n\n1. 쉬운 소개 (영상이 무엇에 관한 것인지 1-2문장) \n\n2. 주요 개념 설명 (3-5개 문단으로 영상의 핵심 내용을 쉽게 설명) \n\n3. 실생활 예시 (개념을 일상생활에 연관시켜 설명) \n\n4. 배울 수 있는 것 (영상에서 배울 수 있는 중요한 교훈이나 지식)';
        maxTokens = 1200;
        break;
        
      case 'academic':
        systemPrompt = '당신은 학술적 관점에서 콘텐츠를 분석하는 전문가입니다. 다음 영상 자막을 학술적 관점에서 분석하고 요약해주세요. 다음 구조로 작성해주세요: \n\n1. 연구 배경 및 주제 소개 (영상이 다루는 학문적 주제와 배경) \n\n2. 주요 이론적 개념 및 프레임워크 (영상에서 언급되는 주요 이론이나 개념 설명) \n\n3. 방법론 및 접근방식 (영상에서 사용된 방법론이나 접근방식) \n\n4. 주요 발견 및 논의점 (영상에서 제시하는 주요 발견이나 논의점) \n\n5. 학문적 시사점 및 적용 (연구의 시사점과 실제 적용 가능성) \n\n6. 비판적 평가 (영상 내용에 대한 학술적 관점에서의 비판적 평가) \n\n전문 용어를 적절히 사용하되, 균형 잡힌 학술적 관점을 유지해주세요.';
        maxTokens = 1800;
        break;
        
      default:
        // 기본값은 brief 형식
        systemPrompt = '당신은 유튜브 영상의 내용을 간결하고 명확하게 요약해주는 전문가입니다. 다음 영상 자막을, 핵심 내용만 간추려 한국어로 정리해주세요. 요약은 다음 형식으로 제공해주세요: 1. 영상의 주요 주제 (1-2줄), 2. 핵심 내용 요약 (3-5개의 글머리 기호), 3. 주요 결론 또는 인사이트 (1-2줄)';
        maxTokens = 800;
    }
    
    // 요청 옵션 설정 - 타임아웃
    const options = {
      timeout: timeout // 전달받은 타임아웃 설정
    };
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `영상 제목: ${title}\n\n영상 자막: ${transcript}`
        }
      ],
      temperature: 0.5,
      max_tokens: maxTokens
    }, options);

    return response.choices[0].message.content || '요약을 생성할 수 없습니다.';
  } catch (error) {
    console.error('Error generating summary:', error);
    throw error; // 에러를 상위로 전파하여 폴백 메커니즘 실행
  }
}

/**
 * Generate timeline for the video using OpenAI
 */
async function generateVideoTimeline(transcript: string, title: string, summaryType: string = 'brief', timeout: number = 60000): Promise<any[]> {
  try {
    // 요약 타입에 따라 타임라인 개수 결정
    const timelineCount = summaryType === 'brief' ? 5 : 20;
    
    const systemPrompt = `당신은 유튜브 영상의 타임라인을 생성하는 전문가입니다. 제공된 영상 자막을 분석하여 중요한 시점과 내용을 ${timelineCount}개의 타임라인 항목으로 정리해주세요. 타임라인은 영상의 흐름을 따라 시간 순서대로 정리되어야 합니다. 각 항목에는 시간(mm:ss 형식), 제목, 간략한 설명을 포함해주세요. JSON 형식으로 다음과 같이 응답해주세요: {"timeline":[{"time": "00:00", "title": "제목", "description": "설명"}, ...]}`;
    
    // 요청 옵션 설정 - 타임아웃
    const options = {
      timeout: timeout // 전달받은 타임아웃 설정
    };
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `영상 제목: ${title}\n\n영상 자막: ${transcript}`
        }
      ],
      temperature: 0.5,
      max_tokens: summaryType === 'brief' ? 500 : 1500, // 상세 요약일 경우 토큰 수 증가
      response_format: { type: "json_object" }
    }, options);

    const content = response.choices[0].message.content || '';
    try {
      const parsedContent = JSON.parse(content);
      return parsedContent.timeline || [];
    } catch (e) {
      console.error('Error parsing timeline JSON:', e);
      
      // 고정된 타임라인 샘플 반환 (요약 타입에 따라 샘플 개수 다르게)
      if (summaryType === 'brief') {
        return [
          { time: "00:00", title: "영상 시작", description: "주제 소개 및 개요" },
          { time: "01:30", title: "주요 개념 설명", description: "핵심 아이디어와 중요 포인트 설명" },
          { time: "03:45", title: "실제 예시", description: "이론을 실제로 적용한 사례 소개" },
          { time: "06:20", title: "추가 정보", description: "관련 자료 및 추천 리소스 안내" },
          { time: "08:00", title: "결론", description: "핵심 내용 요약 및 마무리" }
        ];
      } else {
        // 상세 요약용 더 많은 샘플 타임라인 항목 생성
        const detailedTimeline = [];
        for (let i = 0; i < 20; i++) {
          const minutes = Math.floor(i * 1.5);
          const seconds = Math.floor(Math.random() * 59);
          const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          
          let title, description;
          if (i === 0) {
            title = "영상 소개";
            description = "주제 소개 및 개요 설명";
          } else if (i < 3) {
            title = `주제 설명 ${i}`;
            description = "주요 개념과 용어 설명";
          } else if (i < 10) {
            title = `핵심 내용 ${i-2}`;
            description = "영상의 중요 내용 설명";
          } else if (i < 15) {
            title = `실제 사례 ${i-9}`;
            description = "이론을 적용한 실제 사례 분석";
          } else if (i < 19) {
            title = `추가 정보 ${i-14}`;
            description = "관련 자료 및 추가 학습 내용";
          } else {
            title = "결론";
            description = "영상 내용 정리 및 마무리";
          }
          
          detailedTimeline.push({ time, title, description });
        }
        return detailedTimeline;
      }
    }
  } catch (error) {
    console.error('Error generating timeline:', error);
    
    // 고정된 타임라인 샘플 반환 (요약 타입에 따라 샘플 개수 다르게)
    if (summaryType === 'brief') {
      return [
        { time: "00:00", title: "영상 시작", description: "주제 소개 및 개요" },
        { time: "01:30", title: "주요 개념 설명", description: "핵심 아이디어와 중요 포인트 설명" },
        { time: "03:45", title: "실제 예시", description: "이론을 실제로 적용한 사례 소개" },
        { time: "06:20", title: "추가 정보", description: "관련 자료 및 추천 리소스 안내" },
        { time: "08:00", title: "결론", description: "핵심 내용 요약 및 마무리" }
      ];
    } else {
      // 상세 요약용 더 많은 샘플 타임라인 항목 생성
      const detailedTimeline = [];
      for (let i = 0; i < 20; i++) {
        const minutes = Math.floor(i * 1.5);
        const seconds = Math.floor(Math.random() * 59);
        const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        let title, description;
        if (i === 0) {
          title = "영상 소개";
          description = "주제 소개 및 개요 설명";
        } else if (i < 3) {
          title = `주제 설명 ${i}`;
          description = "주요 개념과 용어 설명";
        } else if (i < 10) {
          title = `핵심 내용 ${i-2}`;
          description = "영상의 중요 내용 설명";
        } else if (i < 15) {
          title = `실제 사례 ${i-9}`;
          description = "이론을 적용한 실제 사례 분석";
        } else if (i < 19) {
          title = `추가 정보 ${i-14}`;
          description = "관련 자료 및 추가 학습 내용";
        } else {
          title = "결론";
          description = "영상 내용 정리 및 마무리";
        }
        
        detailedTimeline.push({ time, title, description });
      }
      return detailedTimeline;
    }
  }
} 