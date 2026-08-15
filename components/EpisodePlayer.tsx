"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Props {
  anime: any;
  episodesCount: number;
}

export default function EpisodePlayer({ anime, episodesCount }: Props) {
  const [currentEpisode, setCurrentEpisode] = useState(1);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [episodeData, setEpisodeData] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const chunkSize = 100;
  const totalChunks = Math.max(1, Math.ceil(episodesCount / chunkSize));
  
  const episodesInCurrentChunk = Math.min(
    chunkSize,
    episodesCount - currentChunkIndex * chunkSize
  );
  
  const episodesArray = Array.from({ length: episodesInCurrentChunk }, (_, i) => i + 1 + currentChunkIndex * chunkSize);

  const hasTrailer = !!anime.trailer?.youtube_id;

  // Fetch episode names for the current chunk
  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoadingEpisodes(true);
      try {
        const res = await fetch(`https://api.jikan.moe/v4/anime/${anime.mal_id}/episodes?page=${currentChunkIndex + 1}`);
        if (res.ok) {
          const json = await res.json();
          setEpisodeData(json.data || []);
        }
      } catch (e) {
        console.error("Failed to fetch episodes", e);
      } finally {
        setLoadingEpisodes(false);
      }
    };
    fetchEpisodes();
  }, [anime.mal_id, currentChunkIndex]);

  // Find current episode name
  const currentEpData = episodeData.find(ep => ep.mal_id === currentEpisode);
  const currentEpName = currentEpData?.title ? ` - ${currentEpData.title}` : "";

  return (
    <>
      {/* Media Player */}
      <div className="mt-8 flex flex-col gap-6">
        <h2 className="text-3xl font-bold text-white border-l-4 border-red-500 pl-4 tracking-wide">
          Watch: {anime.title_english || anime.title} - Episode {currentEpisode} {currentEpName}
        </h2>
        
        <div className="w-full aspect-video bg-[#0a0a0f] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-800 relative group flex items-center justify-center">
          {hasTrailer && currentEpisode === 1 ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}?autoplay=0`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <>
              {/* Mock Video Thumbnail */}
              {anime.images?.jpg?.large_image_url && (
                 <Image
                   src={anime.images.jpg.large_image_url}
                   alt="Video Thumbnail"
                   fill
                   className="object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500"
                 />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80"></div>
              
              <div className="z-10 flex flex-col items-center gap-4 mt-8">
                <button className="bg-red-600/90 hover:bg-red-500 text-white rounded-full p-6 md:p-8 shadow-[0_0_40px_rgba(220,38,38,0.6)] transform hover:scale-110 transition-all duration-300 backdrop-blur-sm">
                  <svg className="w-12 h-12 md:w-16 md:h-16 ml-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                </button>
                <p className="text-white text-lg font-bold drop-shadow-md">Playing Episode {currentEpisode}</p>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 to-transparent flex flex-col gap-4">
                 <div className="flex items-center gap-4 text-sm text-gray-300 font-medium">
                    <span>0:00</span>
                    <div className="flex-1 h-1.5 bg-gray-700 rounded-full relative cursor-pointer group-hover:h-2 transition-all">
                      <div className="absolute left-0 top-0 bottom-0 bg-red-600 w-0 rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)]"></div>
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transform scale-0 group-hover:scale-100 transition-transform"></div>
                    </div>
                    <span>24:00</span>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Episodes List (Scrollable) */}
      <div className="mt-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-gray-800 pb-4 gap-4">
          <h2 className="text-3xl font-bold text-white border-l-4 border-red-500 pl-4 tracking-wide">
            Episodes
          </h2>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-400 font-medium">{episodesCount} Episodes Total</span>
            {totalChunks > 1 && (
              <select 
                value={currentChunkIndex}
                onChange={(e) => setCurrentChunkIndex(Number(e.target.value))}
                className="bg-[#161921] text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-500 outline-none cursor-pointer"
              >
                {Array.from({ length: totalChunks }, (_, i) => i).map(i => {
                  const start = i * chunkSize + 1;
                  const end = Math.min((i + 1) * chunkSize, episodesCount);
                  return <option key={i} value={i}>{start} - {end}</option>;
                })}
              </select>
            )}
          </div>
        </div>
        
        <div className="w-full bg-[#161921] border border-gray-800 rounded-2xl overflow-hidden relative min-h-[100px]">
          {loadingEpisodes && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#161921]/80 backdrop-blur-sm">
              <Image src="/spinner.svg" alt="loading" width={40} height={40} className="object-contain" />
            </div>
          )}
          <div className="max-h-72 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
            {episodesArray.map((ep) => {
              const epData = episodeData.find(e => e.mal_id === ep);
              const epTitle = epData?.title ? `: ${epData.title}` : "";
              
              return (
                <button 
                  key={ep}
                  onClick={() => setCurrentEpisode(ep)}
                  className={`w-full text-left px-6 py-4 rounded-xl transition-all duration-300 flex items-center justify-between group border ${currentEpisode === ep ? 'bg-red-600/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'bg-[#0a0a0f] border-transparent hover:border-gray-600 hover:bg-gray-800 text-gray-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold w-12 ${currentEpisode === ep ? 'text-red-500' : 'text-gray-500 group-hover:text-gray-400'}`}>
                      EP {ep}
                    </span>
                    <span className="font-medium line-clamp-1">
                      Episode {ep}{epTitle}
                    </span>
                  </div>
                  {currentEpisode === ep && (
                    <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Add some global styles for custom scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0a0f;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ef4444;
        }
      `}} />
    </>
  );
}
