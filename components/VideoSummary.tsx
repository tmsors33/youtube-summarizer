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
    .replace(/^\d+\.\s(.*)$/gm, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^•\s(.*)$/gm, '<li class="ml-6 list-disc my-1">$1</li>')
    .replace(/^- (.*)$/gm, '<li class="ml-6 list-disc my-1">$1</li>')
    .replace(/\n\n/g, '<div class="my-3"></div>');
  
  return (
    <div className="card">
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="md:w-1/3">
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={videoDetails.title}
            className="w-full h-auto rounded"
          />
        </div>
        <div className="md:w-2/3">
          <h2 className="text-2xl font-bold mb-2">{videoDetails.title}</h2>
          <p className="text-gray-600 mb-4">{videoDetails.channelTitle}</p>
          <div className="flex flex-wrap gap-2 text-sm text-gray-500 mb-2">
            <span>조회수: {formatViewCount(videoDetails.viewCount)}</span>
            <span className="mx-2">•</span>
            <span>게시일: {new Date(videoDetails.publishedAt).toLocaleDateString('ko-KR')}</span>
          </div>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline mt-2 inline-block"
          >
            유튜브에서 보기
          </a>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">영상 요약</h3>
        <div 
          className="bg-gray-50 p-4 rounded"
          dangerouslySetInnerHTML={{ __html: formattedSummary }}
        />
      </div>
    </div>
  );
};

export default VideoSummary; 