
import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { MediaFile, AspectRatio } from '../types';
import PlayerControls from './PlayerControls';
import { HeadphonesIcon } from './icons';

interface VideoPlayerProps {
  file: MediaFile | null;
  activeSubtitleIndex: number | null;
  onEnded: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  aspectRatio: AspectRatio;
}

// Simple SRT parser
const parseSrt = (srt: string) => {
  const lines = srt.replace(/\r/g, '').split('\n');
  const cues = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('-->')) {
      const [start, end] = lines[i].split(' --> ').map(time => {
        const parts = time.split(/[:,]/);
        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]) + parseInt(parts[3]) / 1000;
      });
      const textLines = [];
      let j = i + 1;
      while(j < lines.length && lines[j]) {
        textLines.push(lines[j]);
        j++;
      }
      cues.push({ start, end, text: textLines.join('\n') });
      i = j;
    }
  }
  return cues;
};

const getVideoClassName = (ratio: AspectRatio): string => {
  switch (ratio) {
    case '16:9':
      return 'max-w-full max-h-full object-cover aspect-[16/9]';
    case '4:3':
      return 'max-w-full max-h-full object-cover aspect-[4/3]';
    case 'fill':
      return 'w-full h-full object-fill';
    case 'original':
    default:
      return 'w-full h-full object-contain';
  }
};


const VideoPlayer: React.FC<VideoPlayerProps> = (props) => {
  const { file, activeSubtitleIndex, onEnded, onNext, onPrevious, hasNext, hasPrevious, aspectRatio } = props;
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [subtitleOffset, setSubtitleOffset] = useState(0);
  const [subtitlePosition, setSubtitlePosition] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if(isFinite(video.duration)) {
        setProgress((video.currentTime / video.duration) * 100);
      } else {
        setProgress(0);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', onEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onEnded]);

  // Handle media source change
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (file) {
      video.src = file.url;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Autoplay started successfully. State is managed by 'play' event listener.
          })
          .catch((error) => {
            if (error.name !== 'AbortError') {
              // Autoplay was prevented or failed for a reason other than being interrupted.
              console.error("Playback error:", error);
              setIsPlaying(false); // Ensure state is correct if autoplay fails.
            }
          });
      }
    } else {
      video.src = '';
      setIsPlaying(false);
    }
    // Reset adjustments on new file
    setSubtitleOffset(0);
    setSubtitlePosition(0);

  }, [file?.url]);

  // Programmatically handle subtitles for timing adjustments
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    // Clear existing text tracks
    for (let i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode = 'disabled';
    }

    const activeSubtitle = file?.subtitles?.[activeSubtitleIndex ?? -1];

    if (!activeSubtitle) return;

    const track = video.addTextTrack('subtitles', activeSubtitle.label, 'en');
    track.mode = 'showing';

    fetch(activeSubtitle.url)
        .then(res => res.text())
        .then(text => {
            const cues = parseSrt(text); // Assuming SRT for now, could be extended for VTT
            cues.forEach(({ start, end, text }) => {
                track.addCue(new VTTCue(start + subtitleOffset, end + subtitleOffset, text));
            });
        }).catch(e => console.error("Error loading subtitle file:", e));
        
    return () => {
      if (track) track.mode = 'disabled'; // Clean up on change
    }

  }, [file, activeSubtitleIndex, subtitleOffset]);
  
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      if (video.paused) {
        video.play().catch(e => console.error("Error playing media:", e));
      } else {
        video.pause();
      }
    }
  }, []);
  
  const handleStop = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, []);


  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (video && isFinite(video.duration)) {
      const seekTime = (Number(e.target.value) / 100) * video.duration;
      video.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if(isMuted && newVolume > 0) setIsMuted(false);
    if (videoRef.current) videoRef.current.volume = newVolume;
  };
  
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  useEffect(() => {
    if(videoRef.current) {
        if(isMuted) {
            videoRef.current.volume = 0;
        } else {
            videoRef.current.volume = volume;
        }
    }
  }, [isMuted, volume]);


  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };
  
  const toggleFullscreen = useCallback(() => {
    const container = playerContainerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
        container.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
        ref={playerContainerRef} 
        className="w-full h-full flex flex-col bg-black text-white relative group"
        style={{ '--subtitle-position-y': `${subtitlePosition}px` } as React.CSSProperties}
    >
      <div className="flex-grow w-full h-full flex items-center justify-center overflow-hidden" onDoubleClick={toggleFullscreen}>
        <video
            ref={videoRef}
            className={getVideoClassName(aspectRatio)}
            onClick={togglePlayPause}
            hidden={file?.isStream}
            crossOrigin="anonymous"
          />
        {(!file || file?.isStream) && (
            <div className="text-center text-gray-500 absolute">
                <HeadphonesIcon className="mx-auto h-24 w-24" />
                <p className="mt-4 text-lg">{file?.name || 'Select a media file to play'}</p>
            </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <PlayerControls
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          currentTime={currentTime}
          volume={isMuted ? 0 : volume}
          playbackRate={playbackRate}
          isFullscreen={isFullscreen}
          isStream={file?.isStream}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          subtitleOffset={subtitleOffset}
          onSubtitleOffsetChange={setSubtitleOffset}
          subtitlePosition={subtitlePosition}
          onSubtitlePositionChange={setSubtitlePosition}
          onPlayPause={togglePlayPause}
          onStop={handleStop}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
          onMute={toggleMute}
          onPlaybackRateChange={changePlaybackRate}
          onFullscreen={toggleFullscreen}
          onNext={onNext}
          onPrevious={onPrevious}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
