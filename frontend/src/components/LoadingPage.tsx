import railwayLogo from 'figma:asset/de6da6a664b190e144e4d86f4481b866fee10e67.png';

export function LoadingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-6">
        <img 
          src={railwayLogo}
          alt="Indian Railways Logo" 
          className="w-32 h-32 object-contain"
        />
        
        <div className="text-center space-y-2">
          <p className="text-gray-700">Loading Railway Management Portal...</p>
        </div>
        
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}