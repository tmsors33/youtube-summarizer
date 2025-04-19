import { useState } from 'react';
import Head from 'next/head';
import { FaYoutube, FaClock } from 'react-icons/fa';
import { extractVideoId } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import YoutubeUrlInput from '@/components/YoutubeUrlInput';
import VideoSummary from '@/components/VideoSummary';
import YoutubePlayer from '@/components/YoutubePlayer';
import VideoTimeline, { timeToSeconds } from '@/components/VideoTimeline';

interface VideoDetails {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
  description: string;
}

interface TimelineItem {
  time: string;
  title: string;
  description: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryType, setSummaryType] = useState('brief');
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [playerStartTime, setPlayerStartTime] = useState('00:00');
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState(0);

  const handleSubmit = async (videoUrl: string, type: string) => {
    // Reset states
    setSummary('');
    setVideoDetails(null);
    setError('');
    setUrl(videoUrl);
    setSummaryType(type);
    setTimeline([]);
    setCurrentTime('00:00');
    setPlayerStartTime('00:00');
    setShowPlayer(false);
    setSelectedTimelineIndex(0);
    
    // Validate URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('유효한 유튜브 URL을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // API 요청 시간 늘리기
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60초 타임아웃

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          videoUrl, 
          summaryType: type,
          generateTimeline: true 
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 504) {
          throw new Error('요청 처리 시간이 너무 길어 타임아웃이 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
        throw new Error('영상 요약 중 오류가 발생했습니다.');
      }
      
      const data = await response.json();
      setSummary(data.summary);
      setVideoDetails(data.videoDetails);
      
      if (data.timeline && Array.isArray(data.timeline)) {
        setTimeline(data.timeline);
      }
      setShowPlayer(true);
    } catch (err: any) {
      console.error('Error submitting:', err);
      if (err.name === 'AbortError') {
        setError('요청 시간이 너무 오래 걸려 취소되었습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(err.message || '영상 요약 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeClick = (time: string, index: number) => {
    setPlayerStartTime(time);
    setSelectedTimelineIndex(index);
    if (!showPlayer) {
      setShowPlayer(true);
    }
  };
  
  const handleTimeUpdate = (time: string) => {
    setCurrentTime(time);
    
    // 현재 시간에 맞는 타임라인 항목 선택
    if (timeline.length > 0) {
      const timeInSeconds = timeToSeconds(time);
      for (let i = 0; i < timeline.length; i++) {
        const currentItemTime = timeToSeconds(timeline[i].time);
        const nextItemTime = i < timeline.length - 1 
          ? timeToSeconds(timeline[i + 1].time) 
          : Number.MAX_SAFE_INTEGER;
        
        if (timeInSeconds >= currentItemTime && timeInSeconds < nextItemTime) {
          if (selectedTimelineIndex !== i) {
            setSelectedTimelineIndex(i);
          }
          break;
        }
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Head>
        <title>유튜브 영상 요약</title>
        <meta name="description" content="유튜브 영상의 내용을 요약해주는 서비스입니다." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="container py-10">
        <div className="flex items-center justify-center mb-8">
          <FaYoutube className="text-primary text-4xl mr-2" />
          <h1 className="text-3xl font-bold">유튜브 영상 요약</h1>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <YoutubeUrlInput onSubmit={handleSubmit} isLoading={isLoading} />
          <p className="text-gray-500 text-sm mb-4">
            일반 YouTube 영상은 대부분 잘 요약되지만, <span className="font-medium">Shorts 영상</span>은 자막 추출 특성상 정확도가 다소 떨어질 수 있습니다.
          </p>
          {error && <p className="text-red-500 mt-2 mb-4">{error}</p>}
          
          {isLoading && (
            <LoadingSpinner message="영상 내용을 요약하고 있습니다. 잠시만 기다려주세요..." />
          )}
          
          {videoDetails && !isLoading && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="lg:w-2/3 order-2 lg:order-1">
                  {timeline.length > 0 && (
                    <div className="mb-6">
                      <VideoTimeline 
                        items={timeline} 
                        onTimeClick={(time, index) => handleTimeClick(time, index)}
                        currentTime={currentTime}
                        selectedIndex={selectedTimelineIndex}
                      />
                    </div>
                  )}
                  
                  <div>
                    <div className="mb-4 flex justify-between items-center">
                      <h2 className="text-xl font-bold flex items-center">
                        <FaClock className="mr-2" /> 영상 요약
                      </h2>
                      <span className="inline-block py-1 px-3 bg-gray-200 rounded-full text-sm">
                        {summaryType === 'brief' ? '짧은 요약' : '상세 요약'}
                      </span>
                    </div>
                    
                    <VideoSummary 
                      videoDetails={videoDetails} 
                      summary={summary} 
                      videoUrl={url} 
                    />
                  </div>
                </div>
                
                <div className="lg:w-1/3 order-1 lg:order-2">
                  {showPlayer && videoDetails && (
                    <div className="sticky top-4">
                      <YoutubePlayer 
                        videoId={videoDetails.id} 
                        startTime={playerStartTime}
                        onTimeUpdate={handleTimeUpdate}
                      />
                      <div className="mt-3 p-3 bg-white rounded-lg shadow-sm border">
                        <h3 className="text-sm font-semibold mb-2">동영상 정보</h3>
                        <p className="text-xs text-gray-600 truncate">{videoDetails.title}</p>
                        <p className="text-xs text-gray-500">{videoDetails.channelTitle}</p>
                        <div className="flex items-center justify-between mt-2">
                          <a
                            href={`https://www.youtube.com/watch?v=${videoDetails.id}`}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="text-xs text-primary hover:underline"
                          >
                            유튜브에서 보기
                          </a>
                          <span className="text-xs text-gray-500">
                            {new Date(videoDetails.publishedAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white py-6 mt-12">
        <div className="container text-center text-gray-500">
          <p>© {new Date().getFullYear()} 유튜브 영상 요약 서비스</p>
        </div>
      </footer>
    </div>
  );
} 