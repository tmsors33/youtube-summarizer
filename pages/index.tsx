import { useState } from 'react';
import Head from 'next/head';
import { FaYoutube, FaClock } from 'react-icons/fa';
import { extractVideoId } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import YoutubeUrlInput from '@/components/YoutubeUrlInput';
import VideoSummary from '@/components/VideoSummary';
import YoutubePlayer from '@/components/YoutubePlayer';
import VideoTimeline from '@/components/VideoTimeline';

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
    
    // Validate URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      setError('유효한 유튜브 URL을 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
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
      });
      
      if (!response.ok) {
        throw new Error('영상 요약 중 오류가 발생했습니다.');
      }
      
      const data = await response.json();
      setSummary(data.summary);
      setVideoDetails(data.videoDetails);
      
      if (data.timeline && Array.isArray(data.timeline)) {
        setTimeline(data.timeline);
      }
    } catch (err: any) {
      setError(err.message || '영상 요약 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeClick = (time: string) => {
    setPlayerStartTime(time);
    if (!showPlayer) {
      setShowPlayer(true);
    }
  };
  
  const handleTimeUpdate = (time: string) => {
    setCurrentTime(time);
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
        
        <div className="max-w-4xl mx-auto">
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
              {showPlayer && videoDetails && (
                <div className="mb-6">
                  <YoutubePlayer 
                    videoId={videoDetails.id} 
                    startTime={playerStartTime}
                    onTimeUpdate={handleTimeUpdate}
                  />
                </div>
              )}
              
              <div className="flex flex-col lg:flex-row gap-6">
                {timeline.length > 0 && (
                  <div className="lg:w-1/3">
                    <VideoTimeline 
                      items={timeline} 
                      onTimeClick={handleTimeClick}
                      currentTime={currentTime}
                    />
                    
                    {!showPlayer && (
                      <button
                        onClick={() => setShowPlayer(true)}
                        className="w-full py-2 px-4 bg-primary text-white rounded-lg flex items-center justify-center mb-6"
                      >
                        <FaYoutube className="mr-2" /> 영상 보기
                      </button>
                    )}
                  </div>
                )}
                
                <div className={timeline.length > 0 ? "lg:w-2/3" : "w-full"}>
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