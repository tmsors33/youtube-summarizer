import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { extractVideoId } from '@/lib/utils';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define response type
type ResponseData = {
  summary: string;
  videoDetails: any;
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
    const { videoUrl, summaryType = 'brief' } = req.body;
    
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

    // Generate summary using OpenAI
    const summary = await generateSummary(transcript, videoDetails.title, summaryType);

    // Return the summary and video details
    return res.status(200).json({
      summary,
      videoDetails,
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: '요약 생성 중 오류가 발생했습니다.' });
  }
}

/**
 * Get video details from YouTube API
 */
async function getVideoDetails(videoId: string) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`;
    
    const response = await axios.get(url);
    
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
 * This is a placeholder - you'll need to implement or use a library for this
 */
async function getVideoTranscript(videoId: string): Promise<string> {
  try {
    // Option 1: Use YouTube Data API (captions endpoint)
    // Note: This requires additional setup and permissions

    // Option 2: Use a third-party service or library
    // For this example, we'll use a simulated transcript
    
    // In a real implementation, you would use a library like youtube-transcript
    // const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    // return transcript.map(item => item.text).join(' ');
    
    // Simulate a small delay to mimic API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, we're returning a placeholder transcript
    // You would replace this with actual transcript fetching logic
    return `이 영상은 ${videoId} 아이디를 가진 유튜브 영상의 내용입니다. 실제 구현에서는 이 부분에 유튜브 API나 서드파티 라이브러리를 사용하여 실제 영상의 자막을 가져와야 합니다. 현재는 예시 텍스트로 대체되었습니다. 이 영상은 다양한 주제를 다루고 있으며, 시청자들에게 유용한 정보를 제공합니다. 콘텐츠 제작자는 이 영상에서 주요 개념을 설명하고, 실제 예시를 보여주며, 시청자들이 이해하기 쉽게 내용을 전달하고 있습니다. 또한 영상에서는 관련 리소스와 추가 학습 자료에 대한 정보도 제공합니다.`;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return '';
  }
}

/**
 * Generate summary using OpenAI's GPT model
 */
async function generateSummary(transcript: string, title: string, summaryType: string = 'brief'): Promise<string> {
  try {
    let systemPrompt = '';
    let maxTokens = 0;
    
    if (summaryType === 'brief') {
      systemPrompt = '당신은 유튜브 영상의 내용을 간결하고 명확하게 요약해주는 전문가입니다. 다음 영상 자막을, 핵심 내용만 간추려 한국어로 정리해주세요. 요약은 다음 형식으로 제공해주세요: 1. 영상의 주요 주제 (1-2줄), 2. 핵심 내용 요약 (3-5개의 글머리 기호), 3. 주요 결론 또는 인사이트 (1-2줄)';
      maxTokens = 500;
    } else if (summaryType === 'detailed') {
      systemPrompt = '당신은 유튜브 영상의 내용을 상세하게 요약해주는 전문가입니다. 다음 영상 자막을 분석하여 한국어로 포괄적인 요약을 제공해주세요. 요약은 다음 형식으로 제공해주세요: 1. 영상 개요 (2-3줄), 2. 주요 섹션별 상세 요약 (각 섹션 2-3 문단), 3. 핵심 인사이트 및 배경 정보 (3-5개 항목), 4. 전문 용어 설명 (필요한 경우), 5. 결론 및 시청자에게 주는 의미 (3-4줄)';
      maxTokens = 1000;
    }
    
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
      max_tokens: maxTokens,
    });

    return response.choices[0].message.content || '요약을 생성할 수 없습니다.';
  } catch (error) {
    console.error('Error generating summary:', error);
    return '요약을 생성하는 중 오류가 발생했습니다. 나중에 다시 시도해 주세요.';
  }
} 