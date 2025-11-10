import React from 'react';
import type { MediaFile, AspectRatio } from '../types';

interface HeaderProps {
    onOpenFileClick: () => void;
    onAddSubtitleClick: () => void;
    isMediaLoaded: boolean;
    currentMedia: MediaFile | null;
    activeSubtitleIndex: number | null;
    onSwitchSubtitle: (index: number | null) => void;
    aspectRatio: AspectRatio;
    onAspectRatioChange: (ratio: AspectRatio) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onOpenFileClick, 
    onAddSubtitleClick, 
    isMediaLoaded,
    currentMedia,
    activeSubtitleIndex,
    onSwitchSubtitle,
    aspectRatio,
    onAspectRatioChange
}) => {
  const aspectRatios: { value: AspectRatio; label: string }[] = [
    { value: 'original', label: 'Original' },
    { value: '16:9', label: '16:9' },
    { value: '4:3', label: '4:3' },
    { value: 'fill', label: 'Fill' },
  ];

  return (
    <header className="bg-[#212121] text-sm font-semibold border-b border-gray-700">
      <div className="px-2 py-1 flex items-center">
        <span className="text-orange-500 font-bold mr-4 text-base">R Player</span>
        <button onClick={onOpenFileClick} className="px-2 py-1 hover:bg-gray-600 rounded">Media</button>
        <button className="px-2 py-1 hover:bg-gray-600 rounded">Playback</button>
        <button className="px-2 py-1 hover:bg-gray-600 rounded">Audio</button>
        <div className="group relative">
            <button 
                className="px-2 py-1 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={!isMediaLoaded}
            >
              Video
            </button>
            {isMediaLoaded && (
              <div className="absolute left-0 mt-1 z-10 hidden group-hover:block bg-[#2d2d2d] border border-gray-700 rounded-md shadow-lg w-56">
                <div className="px-3 py-2 text-xs text-gray-400 border-b border-gray-600">Aspect Ratio</div>
                <div className="max-h-60 overflow-y-auto">
                    {aspectRatios.map(({ value, label }) => (
                        <button 
                            key={value}
                            onClick={() => onAspectRatioChange(value)} 
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 truncate ${aspectRatio === value ? 'bg-orange-600' : ''}`}
                            title={label}
                        >
                            {label}
                        </button>
                    ))}
                </div>
              </div>
            )}
        </div>
        <div className="group relative">
            <button 
                className="px-2 py-1 hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={!isMediaLoaded}
            >
              Subtitle
            </button>
            {isMediaLoaded && (
              <div className="absolute left-0 mt-1 z-10 hidden group-hover:block bg-[#2d2d2d] border border-gray-700 rounded-md shadow-lg w-56">
                <button 
                  onClick={onAddSubtitleClick} 
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-600 border-b border-gray-600"
                >
                  Add Subtitle File...
                </button>
                <div className="max-h-60 overflow-y-auto">
                    <button 
                        onClick={() => onSwitchSubtitle(null)} 
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 ${activeSubtitleIndex === null ? 'bg-orange-600' : ''}`}
                    >
                        Disable
                    </button>
                    {currentMedia?.subtitles?.map((subtitle, index) => (
                        <button 
                            key={subtitle.url}
                            onClick={() => onSwitchSubtitle(index)} 
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-600 truncate ${activeSubtitleIndex === index ? 'bg-orange-600' : ''}`}
                            title={subtitle.label}
                        >
                            {`Track ${index + 1} - ${subtitle.label}`}
                        </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        <button className="px-2 py-1 hover:bg-gray-600 rounded">Tools</button>
        <button className="px-2 py-1 hover:bg-gray-600 rounded">View</button>
        <button className="px-2 py-1 hover:bg-gray-600 rounded">Help</button>
      </div>
    </header>
  );
};

export default Header;