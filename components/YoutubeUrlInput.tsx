import { useState } from 'react';
import { FaPlay } from 'react-icons/fa';

interface YoutubeUrlInputProps {
  onSubmit: (url: string, summaryType: string) => void;
  isLoading: boolean;
}

const YoutubeUrlInput: React.FC<YoutubeUrlInputProps> = ({ 
  onSubmit,
  isLoading
}) => {
  const [url, setUrl] = useState('');
  const [summaryType, setSummaryType] = useState('brief');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url, summaryType);
    }
  };

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
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="summaryType"
                value="brief"
                checked={summaryType === 'brief'}
                onChange={() => setSummaryType('brief')}
                className="text-primary"
              />
              <span>짧게 요약</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="summaryType"
                value="detailed"
                checked={summaryType === 'detailed'}
                onChange={() => setSummaryType('detailed')}
                className="text-primary"
              />
              <span>상세히 요약</span>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary whitespace-nowrap w-full sm:w-auto"
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