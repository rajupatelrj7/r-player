import React, { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, StopIcon, VolumeHighIcon, VolumeMutedIcon, FullscreenEnterIcon, FullscreenExitIcon, NextIcon, PreviousIcon, SpeedIcon, SubtitlesIcon } from './icons';

interface PlayerControlsProps {
  isPlaying: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  volume: number;
  playbackRate: number;
  isFullscreen: boolean;
  isStream?: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  subtitleOffset: number;
  onSubtitleOffsetChange: (offset: number) => void;
  subtitlePosition: number;
  onSubtitlePositionChange: (position: number) => void;
  onPlayPause: () => void;
  onStop: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMute: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onFullscreen: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const formatTime = (timeInSeconds: number): string => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0 || !isFinite(timeInSeconds)) {
    return '00:00';
  }
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${formattedMinutes}:${formattedSeconds}`;
  }
  return `${formattedMinutes}:${formattedSeconds}`;
};

const PlayerControls: React.FC<PlayerControlsProps> = (props) => {
  const {
    isPlaying,
    progress,
    duration,
    currentTime,
    volume,
    playbackRate,
    isFullscreen,
    isStream,
    hasNext,
    hasPrevious,
    subtitleOffset,
    onSubtitleOffsetChange,
    subtitlePosition,
    onSubtitlePositionChange,
    onPlayPause,
    onStop,
    onSeek,
    onVolumeChange,
    onMute,
    onPlaybackRateChange,
    onFullscreen,
    onNext,
    onPrevious,
  } = props;
  
  const hasMedia = isStream || duration > 0;
  const [isSpeedMenuOpen, setIsSpeedMenuOpen] = useState(false);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
            setIsSpeedMenuOpen(false);
        }
    };
    if (isSpeedMenuOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSpeedMenuOpen]);

  
  return (
    <div className="bg-[#212121] p-2 border-t border-gray-700">
      <div className="w-full">
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={onSeek}
          className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(to right, #fb923c ${progress}%, #4a5568 ${progress}%)`
          }}
          disabled={!hasMedia || isStream}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-4">
          <button onClick={onPrevious} disabled={!hasPrevious} className="text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
            <PreviousIcon />
          </button>
          <button onClick={onPlayPause} disabled={!hasMedia} className="text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
           <button onClick={onStop} disabled={!hasMedia || isStream} className="text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
            <StopIcon />
          </button>
          <button onClick={onNext} disabled={!hasNext} className="text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
            <NextIcon />
          </button>
        </div>

        <div className="text-sm font-mono">
          {isStream ? (
              <span className="text-green-400 font-bold">LIVE</span>
          ) : (
             <>
                <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
             </>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex items-center" ref={speedMenuRef}>
            <button 
              onClick={() => setIsSpeedMenuOpen(prev => !prev)} 
              disabled={!hasMedia || isStream} 
              className="text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SpeedIcon />
            </button>
            {isSpeedMenuOpen && (
              <div className="absolute bottom-full mb-2 bg-gray-800 border border-gray-700 rounded-md p-2 shadow-lg">
                  <div className="flex flex-col space-y-1">
                      {[0.5, 1, 1.5, 2].map(rate => (
                          <button 
                            key={rate} 
                            onClick={() => {
                              onPlaybackRateChange(rate);
                              setIsSpeedMenuOpen(false);
                            }} 
                            className={`px-2 py-1 text-sm rounded ${playbackRate === rate ? 'bg-orange-500' : 'hover:bg-gray-600'}`}
                          >
                            {rate}x
                          </button>
                      ))}
                  </div>
              </div>
            )}
          </div>
          
          <div className="group relative flex items-center">
            <button disabled={!hasMedia || isStream} className="text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"><SubtitlesIcon /></button>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-800 border border-gray-700 rounded-md p-3 shadow-lg w-64">
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold block mb-1">Timing Offset</label>
                        <div className="flex items-center justify-between">
                            <button onClick={() => onSubtitleOffsetChange(subtitleOffset - 0.1)} className="px-3 py-1 bg-gray-700 rounded">-</button>
                            <span className="font-mono text-sm">{(subtitleOffset).toFixed(2)}s</span>
                            <button onClick={() => onSubtitleOffsetChange(subtitleOffset + 0.1)} className="px-3 py-1 bg-gray-700 rounded">+</button>
                        </div>
                    </div>
                     <div>
                        <label className="text-xs font-bold block mb-1">Position</label>
                        <div className="flex items-center">
                             <input
                                type="range"
                                min="-200"
                                max="50"
                                step="5"
                                value={subtitlePosition}
                                onChange={(e) => onSubtitlePositionChange(Number(e.target.value))}
                                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                />
                        </div>
                    </div>
                </div>
            </div>
          </div>

          <div className="flex items-center w-32">
            <button onClick={onMute} disabled={!hasMedia} className="text-gray-300 hover:text-white mr-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {volume > 0 ? <VolumeHighIcon /> : <VolumeMutedIcon />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={onVolumeChange}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #fff ${volume*100}%, #4a5568 ${volume*100}%)`
              }}
              disabled={!hasMedia}
            />
          </div>

          <button onClick={onFullscreen} disabled={!hasMedia} className="text-gray-300 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenEnterIcon />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;