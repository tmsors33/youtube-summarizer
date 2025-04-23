import { useState } from 'react';
import { FaPlay, FaChevronDown } from 'react-icons/fa';

interface YoutubeUrlInputProps {
  onSubmit: (url: string, summaryType: string) => void;
  isLoading: boolean;
}

const summaryOptions = [
  { id: 'brief', name: '짧게 요약', description: '핵심 내용만 빠르게 파악' },
  { id: 'detailed', name: '상세히 요약', description: '섹션별 자세한 내용 및 인사이트' },
  { id: 'bullet', name: '핵심 포인트', description: '글머리 기호로 정리된 주요 포인트' },
  { id: 'eli5', name: '쉽게 설명', description: '초보자도 이해할 수 있는 설명' },
  { id: 'academic', name: '학술적 요약', description: '중요 개념과 이론적 접근' },
];

const YoutubeUrlInput: React.FC<YoutubeUrlInputProps> = ({ 
  onSubmit,
  isLoading
}) => {
  const [url, setUrl] = useState('');
  const [summaryType, setSummaryType] = useState('brief');
  const [showOptions, setShowOptions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url, summaryType);
    }
  };

  const selectedOption = summaryOptions.find(option => option.id === summaryType);

  return (
    <form onSubmit={handleSubmit} className="mb-8">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="유튜브 URL을 입력하세요"
          className="input flex-grow"
          disabled={isLoading}
          required
        />
        
        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          {/* 요약 유형 선택 드롭다운 */}
          <div className="relative flex-grow">
            <button
              type="button"
              className="flex justify-between items-center w-full px-4 py-2 border border-gray-300 rounded-md bg-white"
              onClick={() => setShowOptions(!showOptions)}
              disabled={isLoading}
            >
              <div>
                <div className="font-medium">{selectedOption?.name}</div>
                <div className="text-xs text-gray-500">{selectedOption?.description}</div>
              </div>
              <FaChevronDown className={`transition-transform ${showOptions ? 'rotate-180' : ''}`} />
            </button>
            
            {showOptions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-md z-10">
                {summaryOptions.map(option => (
                  <div
                    key={option.id}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${summaryType === option.id ? 'bg-gray-50' : ''}`}
                    onClick={() => {
                      setSummaryType(option.id);
                      setShowOptions(false);
                    }}
                  >
                    <div className="font-medium">{option.name}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary whitespace-nowrap sm:w-auto"
            disabled={isLoading}
          >
            <div className="flex items-center justify-center">
              {isLoading ? (
                <>
                  <span className="animate-pulse mr-2">•••</span>
                  <span>요약 중</span>
                </>
              ) : (
                <>
                  <FaPlay className="mr-2" />
                  <span>요약하기</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </form>
  );
};

export default YoutubeUrlInput; 