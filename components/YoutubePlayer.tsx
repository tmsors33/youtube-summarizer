import React, { useRef, useEffect, useState } from 'react';
import { timeToSeconds } from './VideoTimeline';

// YouTube IFrame API 타입 선언
declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YoutubePlayerProps {
  videoId: string;
  startTime?: string; // "00:00" 형식
  onTimeUpdate?: (currentTime: string) => void;
}

const YoutubePlayer: React.FC<YoutubePlayerProps> = ({ 
  videoId, 
  startTime = '00:00',
  onTimeUpdate 
}) => {
  const playerRef = useRef<HTMLIFrameElement>(null);
  const [player, setPlayer] = useState<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  
  // YouTube IFrame API 로드
  useEffect(() => {
    // 이미 API가 로드되었는지 확인
    if (window.YT) {
      initializePlayer();
      return;
    }
    
    // 글로벌 콜백 함수 정의
    window.onYouTubeIframeAPIReady = initializePlayer;
    
    // API 스크립트 로드
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    
    return () => {
      // 컴포넌트 언마운트시 정리
      window.onYouTubeIframeAPIReady = null as any;
    };
  }, [videoId]);
  
  // 플레이어 초기화
  const initializePlayer = () => {
    if (!window.YT || !window.YT.Player) {
      console.error('YouTube IFrame API not available');
      return;
    }
    
    if (player) {
      player.destroy();
    }
    
    const newPlayer = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        start: timeToSeconds(startTime)
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    });
    
    setPlayer(newPlayer);
  };
  
  // 플레이어 준비 완료 콜백
  const onPlayerReady = (event: any) => {
    setIsPlayerReady(true);
  };
  
  // 플레이어 상태 변경 콜백
  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      startTimeTracking();
    } else {
      stopTimeTracking();
    }
  };
  
  // 시간 추적 인터벌 관리
  const [timeTrackingInterval, setTimeTrackingInterval] = useState<NodeJS.Timeout | null>(null);
  
  const startTimeTracking = () => {
    if (timeTrackingInterval) {
      clearInterval(timeTrackingInterval);
    }
    
    const interval = setInterval(() => {
      if (player && typeof player.getCurrentTime === 'function' && onTimeUpdate) {
        const currentTime = player.getCurrentTime();
        const formattedTime = new Date(currentTime * 1000).toISOString().substr(14, 5);
        onTimeUpdate(formattedTime);
      }
    }, 1000);
    
    setTimeTrackingInterval(interval);
  };
  
  const stopTimeTracking = () => {
    if (timeTrackingInterval) {
      clearInterval(timeTrackingInterval);
      setTimeTrackingInterval(null);
    }
  };
  
  // 컴포넌트 언마운트시 정리
  useEffect(() => {
    return () => {
      stopTimeTracking();
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [player]);
  
  // startTime이 변경되면 해당 시간으로 이동
  useEffect(() => {
    if (isPlayerReady && player && typeof player.seekTo === 'function') {
      player.seekTo(timeToSeconds(startTime), true);
      player.playVideo();
    }
  }, [startTime, isPlayerReady]);
  
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden shadow-lg">
      <div className="bg-black rounded-lg p-2">
        <h3 className="text-white text-sm mb-2 font-semibold">현재 재생 중</h3>
        <div className="aspect-video" id="youtube-player"></div>
      </div>
    </div>
  );
};

export default YoutubePlayer; 