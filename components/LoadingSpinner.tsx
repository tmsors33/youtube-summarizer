import React, { useState, useEffect } from 'react';
import { FaSpinner, FaYoutube, FaFileAlt, FaClipboard } from 'react-icons/fa';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = '로딩 중입니다...' 
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loadingPhase, setLoadingPhase] = useState(0);
  
  // 경과 시간 추적
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // 로딩 단계 변경
  useEffect(() => {
    if (elapsedTime > 3 && elapsedTime <= 10) {
      setLoadingPhase(1); // 유튜브 데이터 가져오기
    } else if (elapsedTime > 10 && elapsedTime <= 25) {
      setLoadingPhase(2); // 자막 분석 중
    } else if (elapsedTime > 25) {
      setLoadingPhase(3); // 요약 생성 중
    }
  }, [elapsedTime]);
  
  // 로딩 단계별 메시지
  const getPhaseMessage = () => {
    switch (loadingPhase) {
      case 0:
        return "유튜브 영상 정보를 가져오는 중입니다...";
      case 1:
        return "영상 데이터를 처리하는 중입니다...";
      case 2:
        return "영상 내용을 분석하는 중입니다...";
      case 3:
        return "요약 및 타임라인을 생성하는 중입니다...";
      default:
        return message;
    }
  };
  
  // 로딩 단계별 아이콘
  const getPhaseIcon = () => {
    switch (loadingPhase) {
      case 0:
      case 1:
        return <FaYoutube className="animate-pulse text-4xl text-primary mb-4" />;
      case 2:
        return <FaFileAlt className="animate-pulse text-4xl text-primary mb-4" />;
      case 3:
        return <FaClipboard className="animate-pulse text-4xl text-primary mb-4" />;
      default:
        return <FaSpinner className="animate-spin text-4xl text-primary mb-4" />;
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="mb-4 relative">
        {getPhaseIcon()}
        <FaSpinner className="animate-spin text-4xl text-primary absolute top-0 left-0 opacity-50" />
      </div>
      <p className="text-lg font-medium mb-2">{getPhaseMessage()}</p>
      <p className="text-sm text-gray-500">
        {elapsedTime >= 30 ? 
          "처리 시간이 길어지고 있습니다. 잠시만 더 기다려주세요..." : 
          `경과 시간: ${elapsedTime}초`
        }
      </p>
      {elapsedTime >= 45 && (
        <p className="text-xs text-red-500 mt-2">
          요청 처리 시간이 길어지고 있습니다. 네트워크 상태나 영상 길이에 따라 최대 1분까지 소요될 수 있습니다.
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner; 