
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { MediaFile, RadioStation, Subtitle, AspectRatio } from './types';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import Playlist from './components/Playlist';

const radioStations: RadioStation[] = [
  // France
  { name: 'Lofi Girl 🎶', url: 'https://play.streamaud.io/lofi-girl', country: 'France' },
  { name: 'Deep House Radio', url: 'https://streaming.radionomy.com/DeepHouseRadio', country: 'France' },
  // India
  { name: 'Radio Mirchi US', url: 'https://stream.zeno.fm/fvrx194g44zuv', country: 'India' },
  { name: 'Radio City Hindi', url: 'https://prisa-radio-city-hindi-aac.cdn.streamfast.biz/prisa-radio-city-hindi-aac', country: 'India' },
  // Russia
  { name: 'Record Russian Mix', url: 'https://air.radiorecord.ru/rus_320.mp3', country: 'Russia' },
  { name: 'DFM', url: 'https://dfm.hostingradio.ru/dfm_320.mp3', country: 'Russia' },
  // UK
  { name: 'NTS Radio', url: 'https://stream-relay-geo.ntslive.net/stream', country: 'UK' },
  // USA
  { name: 'Radio Paradise: Mellow Mix', url: 'https://stream.radioparadise.com/mellow-320', country: 'USA' },
  { name: 'SomaFM: Groove Salad', url: 'https://ice6.somafm.com/groovesalad-128-mp3', country: 'USA' },
  { name: 'SomaFM: DEF CON Radio', url: 'https://ice6.somafm.com/defcon-128-mp3', country: 'USA' },
  { name: 'SomaFM: Drone Zone', url: 'https://ice6.somafm.com/dronezone-128-mp3', country: 'USA' },
  { name: 'SomaFM: Secret Agent', url: 'https://ice6.somafm.com/secretagent-128-mp3', country: 'USA' },
  { name: 'SomaFM: Lush', url: 'https://ice6.somafm.com/lush-128-mp3', country: 'USA' },
  { name: 'Nightwave Plaza', url: 'https://radio.plaza.one/mp3', country: 'USA' },
  { name: 'Radio Paradise: Main Mix', url: 'https://stream.radioparadise.com/mp3-192', country: 'USA' },
  { name: 'Radio Paradise: Rock Mix', url: 'https://stream.radioparadise.com/rock-320', country: 'USA' },
  { name: 'WNYC 93.9 FM', url: 'https://fm939.wnyc.org/wnycfm', country: 'USA' },
  { name: 'The Current', url: 'https://current.stream.publicradio.org/current.mp3', country: 'USA' },
  { name: 'Classical MPR', url: 'https://cms.stream.publicradio.org/cms.mp3', country: 'USA' },
  { name: 'Jazz24', url: 'https://d.live.npr.org/streams/KNKX_JAZZ24_128.mp3', country: 'USA' },
];

const App: React.FC = () => {
  const [playlist, setPlaylist] = useState<MediaFile[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);
  const [currentMedia, setCurrentMedia] = useState<MediaFile | null>(null);
  const [currentStationIndex, setCurrentStationIndex] = useState<number | null>(null);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState<number | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('original');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);
  const playlistRef = useRef(playlist);
  playlistRef.current = playlist;

  useEffect(() => {
    // Cleanup object URLs on unmount to prevent memory leaks
    return () => {
      playlistRef.current.forEach(file => {
        if (!file.isStream && file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
          file.subtitles?.forEach(sub => URL.revokeObjectURL(sub.url));
        }
      });
    };
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: MediaFile[] = Array.from(files).map((file: File) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      isStream: false,
      subtitles: [],
    }));
    
    const initialPlaylistSize = playlist.length;
    setPlaylist(prev => [...prev, ...newFiles]);

    if (currentMedia === null) {
      setCurrentFileIndex(initialPlaylistSize);
      setCurrentMedia(newFiles[0]);
    }
    event.target.value = '';
  };

  const handleSubtitleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || currentFileIndex === null) return;

    const newSubtitles: Subtitle[] = Array.from(files).map(file => ({
      url: URL.createObjectURL(file),
      label: file.name,
    }));

    const newPlaylist = [...playlist];
    const currentFile = newPlaylist[currentFileIndex];
    const existingSubtitles = currentFile.subtitles || [];
    
    const updatedFile = {
      ...currentFile,
      subtitles: [...existingSubtitles, ...newSubtitles],
    };
    newPlaylist[currentFileIndex] = updatedFile;
    
    setPlaylist(newPlaylist);
    setCurrentMedia(updatedFile);
    
    // If no subtitle was active, activate the first one added.
    if (activeSubtitleIndex === null) {
      setActiveSubtitleIndex(existingSubtitles.length);
    }

    event.target.value = '';
  };


  const handleOpenFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleAddSubtitleClick = () => {
    subtitleInputRef.current?.click();
  };
  
  const handleSelectFile = useCallback((index: number) => {
    if (playlist[index]) {
      setCurrentFileIndex(index);
      setCurrentMedia(playlist[index]);
      setActiveSubtitleIndex(playlist[index].subtitles?.length ? 0 : null);
      setCurrentStationIndex(null);
    }
  }, [playlist]);

  const handleSwitchSubtitle = (index: number | null) => {
    setActiveSubtitleIndex(index);
  };

  const handleSelectStation = useCallback((station: RadioStation, index: number) => {
    setCurrentMedia({
      name: station.name,
      url: station.url,
      type: 'audio/mpeg',
      isStream: true,
    });
    setCurrentFileIndex(null); // Deselect any playlist item
    setCurrentStationIndex(index);
    setActiveSubtitleIndex(null);
  }, []);

  const handleNextStation = useCallback(() => {
    if (currentStationIndex !== null && currentStationIndex < radioStations.length - 1) {
      const nextIndex = currentStationIndex + 1;
      handleSelectStation(radioStations[nextIndex], nextIndex);
    }
  }, [currentStationIndex, handleSelectStation]);

  const handlePreviousStation = useCallback(() => {
    if (currentStationIndex !== null && currentStationIndex > 0) {
      const prevIndex = currentStationIndex - 1;
      handleSelectStation(radioStations[prevIndex], prevIndex);
    }
  }, [currentStationIndex, handleSelectStation]);

  const handleNext = useCallback(() => {
    if (currentFileIndex !== null && currentFileIndex < playlist.length - 1) {
      const nextIndex = currentFileIndex + 1;
      handleSelectFile(nextIndex);
    }
  }, [currentFileIndex, playlist.length, handleSelectFile]);
  
  const handlePrevious = useCallback(() => {
    if (currentFileIndex !== null && currentFileIndex > 0) {
      const prevIndex = currentFileIndex - 1;
      handleSelectFile(prevIndex);
    }
  }, [currentFileIndex, handleSelectFile]);

  const handleRemoveFile = (indexToRemove: number) => {
    const fileToRemove = playlist[indexToRemove];
    if (fileToRemove && !fileToRemove.isStream && fileToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.url);
        fileToRemove.subtitles?.forEach(sub => URL.revokeObjectURL(sub.url));
    }
    
    const newPlaylist = playlist.filter((_, index) => index !== indexToRemove);
    setPlaylist(newPlaylist);

    if (currentFileIndex !== null) {
      if (indexToRemove === currentFileIndex) {
        if (newPlaylist.length === 0) {
          setCurrentFileIndex(null);
          setCurrentMedia(null);
          setActiveSubtitleIndex(null);
        } else {
          // Play the item that is now at the same index, or the last item if it was the last one.
          const newIndex = Math.min(indexToRemove, newPlaylist.length - 1);
          setCurrentFileIndex(newIndex);
          setCurrentMedia(newPlaylist[newIndex]);
          setActiveSubtitleIndex(newPlaylist[newIndex].subtitles?.length ? 0 : null);
        }
      } else if (indexToRemove < currentFileIndex) {
        setCurrentFileIndex(currentFileIndex - 1);
      }
    }
  };

  const handleReorderPlaylist = (dragIndex: number, dropIndex: number) => {
    if (dragIndex === dropIndex) return;
    
    const newPlaylist = [...playlist];
    const [draggedItem] = newPlaylist.splice(dragIndex, 1);
    newPlaylist.splice(dropIndex, 0, draggedItem);
    
    if (currentFileIndex !== null) {
      let newCurrentIndex = currentFileIndex;
      if (currentFileIndex === dragIndex) {
        newCurrentIndex = dropIndex;
      } else if (dragIndex < currentFileIndex && dropIndex >= currentFileIndex) {
        newCurrentIndex--;
      } else if (dragIndex > currentFileIndex && dropIndex <= currentFileIndex) {
        newCurrentIndex++;
      }
      setCurrentFileIndex(newCurrentIndex);
    }

    setPlaylist(newPlaylist);
  };

  return (
    <div className="flex flex-col h-screen bg-[#2d2d2d] font-sans">
      <Header 
        onOpenFileClick={handleOpenFileClick} 
        onAddSubtitleClick={handleAddSubtitleClick}
        isMediaLoaded={currentMedia !== null && !currentMedia.isStream}
        currentMedia={currentMedia}
        activeSubtitleIndex={activeSubtitleIndex}
        onSwitchSubtitle={handleSwitchSubtitle}
        aspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="video/*,audio/*"
        multiple
      />
      <input
        type="file"
        ref={subtitleInputRef}
        onChange={handleSubtitleFileChange}
        className="hidden"
        accept=".vtt,.srt"
        multiple
      />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col bg-black min-w-0">
          <VideoPlayer 
            file={currentMedia}
            activeSubtitleIndex={activeSubtitleIndex}
            onEnded={handleNext}
            onNext={handleNext}
            onPrevious={handlePrevious}
            hasNext={currentFileIndex !== null && currentFileIndex < playlist.length - 1}
            hasPrevious={currentFileIndex !== null && currentFileIndex > 0}
            aspectRatio={aspectRatio}
          />
        </div>
        <Playlist
          files={playlist}
          currentFileIndex={currentFileIndex}
          onSelectFile={handleSelectFile}
          onOpenFileClick={handleOpenFileClick}
          onRemoveFile={handleRemoveFile}
          onReorderPlaylist={handleReorderPlaylist}
          stations={radioStations}
          currentMedia={currentMedia}
          onSelectStation={handleSelectStation}
          currentStationIndex={currentStationIndex}
          onNextStation={handleNextStation}
          onPreviousStation={handlePreviousStation}
        />
      </main>
    </div>
  );
};

export default App;
