import React from 'react';
import { FaPlay } from 'react-icons/fa';

interface TimelineItem {
  time: string; // 형식: "00:00"
  title: string;
  description: string;
}

interface VideoTimelineProps {
  items: TimelineItem[];
  onTimeClick: (time: string, index: number) => void;
  currentTime?: string;
  selectedIndex?: number;
}

// 시간 문자열(00:00)을 초 단위로 변환하는 함수
export const timeToSeconds = (time: string): number => {
  const [minutes, seconds] = time.split(':').map(Number);
  return minutes * 60 + seconds;
};

// 초 단위를 시간 문자열(00:00)로 변환하는 함수
export const secondsToTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const VideoTimeline: React.FC<VideoTimelineProps> = ({ 
  items, 
  onTimeClick,
  currentTime = '00:00',
  selectedIndex = 0
}) => {
  const currentSeconds = timeToSeconds(currentTime);

  return (
    <div className="border rounded-lg p-4 bg-white mb-6">
      <h3 className="text-xl font-semibold mb-4">영상 타임라인</h3>
      <div className="space-y-3">
        {items.map((item, index) => {
          const itemSeconds = timeToSeconds(item.time);
          const isActive = index === selectedIndex;
          
          return (
            <div 
              key={index}
              className={`p-3 rounded-lg transition-colors cursor-pointer ${
                isActive ? 'bg-primary bg-opacity-10 border-l-4 border-primary' : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => onTimeClick(item.time, index)}
            >
              <div className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-3 ${
                  isActive ? 'bg-primary text-white' : 'bg-gray-200'
                }`}>
                  <span className="font-mono font-medium">{item.time}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <FaPlay className={`ml-2 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VideoTimeline; 