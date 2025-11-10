
import React, { useState } from 'react';
import type { MediaFile, RadioStation } from '../types';
import { PlayIcon, FileIcon, CloseIcon, DragHandleIcon, RadioIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface PlaylistProps {
  files: MediaFile[];
  currentFileIndex: number | null;
  onSelectFile: (index: number) => void;
  onOpenFileClick: () => void;
  onRemoveFile: (index: number) => void;
  onReorderPlaylist: (dragIndex: number, dropIndex: number) => void;
  // Radio props
  stations: RadioStation[];
  currentMedia: MediaFile | null;
  currentStationIndex: number | null;
  onSelectStation: (station: RadioStation, index: number) => void;
  onNextStation: () => void;
  onPreviousStation: () => void;
}

const Playlist: React.FC<PlaylistProps> = (props) => {
  const { 
    files, currentFileIndex, onSelectFile, onOpenFileClick, onRemoveFile, onReorderPlaylist,
    stations, currentMedia, currentStationIndex, onSelectStation, onNextStation, onPreviousStation
  } = props;
  
  const [activeTab, setActiveTab] = useState<'playlist' | 'radio'>('playlist');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null) return;
    onReorderPlaylist(dragIndex, dropIndex);
    setDragIndex(null);
  };

  const renderPlaylist = () => (
    files.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
          <p className="mb-4">Your playlist is empty.</p>
          <button
          onClick={onOpenFileClick}
          className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
        >
          Open File(s)
        </button>
      </div>
    ) : (
      <ul>
        {files.map((file, index) => (
          <li
            key={file.url}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => onSelectFile(index)}
            className={`group flex items-center p-2 cursor-pointer hover:bg-gray-700 transition-opacity ${currentFileIndex === index ? 'bg-orange-600' : ''} ${dragIndex === index ? 'opacity-50' : ''}`}
          >
            <div className="text-gray-400 mr-2 cursor-move">
              <DragHandleIcon />
            </div>
            {currentFileIndex === index ? 
              <PlayIcon className="w-5 h-5 mr-2 text-white flex-shrink-0" /> :
              <FileIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
            }
            <span className="truncate flex-1 text-sm">{file.name}</span>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile(index);
              }}
              className="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Remove ${file.name}`}
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </li>
        ))}
      </ul>
    )
  );
  
  const renderRadio = () => {
    const groupedStations = stations.reduce((acc, station) => {
      (acc[station.country] = acc[station.country] || []).push(station);
      return acc;
    }, {} as Record<string, RadioStation[]>);

    const sortedCountries = Object.keys(groupedStations).sort();

    const currentStation = currentStationIndex !== null ? stations[currentStationIndex] : null;

    return (
      <div>
        <div className="p-2 border-b border-gray-700 bg-gray-800">
          <div className="flex items-center justify-between">
            <button 
              onClick={onPreviousStation} 
              disabled={currentStationIndex === null || currentStationIndex === 0}
              className="p-1 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeftIcon />
            </button>
            <div className="text-center flex-1 mx-2">
                <div className="text-xs text-gray-400">Now Tuning</div>
                <div className="font-bold truncate" title={currentStation?.name || 'Select a Station'}>
                    {currentStation?.name || 'Select a Station'}
                </div>
            </div>
            <button 
              onClick={onNextStation} 
              disabled={currentStationIndex === null || currentStationIndex === stations.length - 1}
              className="p-1 rounded-full hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronRightIcon />
            </button>
          </div>
        </div>
        {sortedCountries.map((country) => (
          <div key={country}>
            <h3 className="px-2 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider">{country}</h3>
            <ul>
              {groupedStations[country].map((station) => {
                const globalIndex = stations.findIndex(s => s.url === station.url);
                const isPlaying = currentMedia?.isStream && currentMedia.url === station.url;
                return (
                  <li
                    key={station.url}
                    onClick={() => onSelectStation(station, globalIndex)}
                    className={`group flex items-center p-2 cursor-pointer hover:bg-gray-700 ${isPlaying ? 'bg-orange-600' : ''}`}
                  >
                    {isPlaying ? (
                      <PlayIcon className="w-5 h-5 mr-2 text-white flex-shrink-0" />
                    ) : (
                      <RadioIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                    )}
                    <span className="truncate flex-1 text-sm">{station.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    );
  };


  return (
    <aside className="w-64 bg-[#212121] flex flex-col border-l border-gray-700">
      <div className="flex border-b border-gray-700">
        <button 
          onClick={() => setActiveTab('playlist')}
          className={`flex-1 p-2 text-center font-bold text-sm ${activeTab === 'playlist' ? 'bg-gray-700 text-white' : 'bg-[#212121] text-gray-400 hover:bg-gray-600'}`}
        >
          Playlist
        </button>
        <button 
          onClick={() => setActiveTab('radio')}
          className={`flex-1 p-2 text-center font-bold text-sm ${activeTab === 'radio' ? 'bg-gray-700 text-white' : 'bg-[#212121] text-gray-400 hover:bg-gray-600'}`}
        >
          Radio
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'playlist' ? renderPlaylist() : renderRadio()}
      </div>
    </aside>
  );
};

export default Playlist;
