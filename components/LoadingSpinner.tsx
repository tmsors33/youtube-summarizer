import { FaSpinner } from 'react-icons/fa';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = '로딩 중입니다...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <FaSpinner className="animate-spin text-4xl text-primary mb-4" />
      <p className="text-lg">{message}</p>
    </div>
  );
};

export default LoadingSpinner; 