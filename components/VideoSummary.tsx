import { extractVideoId, formatViewCount } from '@/lib/utils';

interface VideoDetails {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
}

interface VideoSummaryProps {
  videoDetails: VideoDetails;
  summary: string;
  videoUrl: string;
}

const VideoSummary: React.FC<VideoSummaryProps> = ({
  videoDetails,
  summary,
  videoUrl
}) => {
  const videoId = extractVideoId(videoUrl);
  
  // 요약 내용에서 숫자 목록 항목을 강조하기 위해 정규식을 사용하여 스타일링
  const formattedSummary = summary
    ? summary
        .replace(/^\d+\.\s(.*)$/gm, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>')
        .replace(/^•\s(.*)$/gm, '<li class="ml-6 list-disc my-1">$1</li>')
        .replace(/^- (.*)$/gm, '<li class="ml-6 list-disc my-1">$1</li>')
        .replace(/\n\n/g, '<div class="my-3"></div>')
    : '요약 내용을 불러오는 중입니다...';
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-1">{videoDetails.title}</h2>
        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
          <span>조회수: {formatViewCount(videoDetails.viewCount)}</span>
          <span className="mx-1">•</span>
          <span>채널: {videoDetails.channelTitle}</span>
        </div>
      </div>
      
      <div>
        <div 
          className="bg-gray-50 p-4 rounded prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: formattedSummary }}
        />
      </div>
    </div>
  );
};

export default VideoSummary; 