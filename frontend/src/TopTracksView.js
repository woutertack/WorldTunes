// src/TopTracksView.js
import React, { useState, useEffect, useRef } from 'react';
import { getSpotifyAccessToken } from './utils/spotify';
import './TopTracksView.css';


const TopTracksView = ({ artist, onBack }) => {
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    async function fetchTopTracks() {
      const token = await getSpotifyAccessToken();
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/artists/${artist.spotifyId}/top-tracks?market=US`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setTopTracks(data.tracks || []);
      } catch (error) {
        console.error(`Error fetching top tracks for ${artist.name}:`, error);
      }
    }
    fetchTopTracks();
  }, [artist]);

  return (
    <div className="top-tracks-view">
      

      <div className="songs-info">
  <img src={artist.imageUrl || 'https://via.placeholder.com/150'} alt={artist.name} className="song-img" />
  <div className="songs-wrapper">
    <h2 className="songs-name">{artist.name}</h2>

    {/* Spotify link button with SVG icon */}
    <a
      href={`https://open.spotify.com/artist/${artist.spotifyId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="spotify-button"
    >
      {/* Spotify SVG icon */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 496 512" 
        className="spotify-icon"
        width="40" 
        height="40" 
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/>
      </svg>
      Open in Spotify
    </a>
  </div>
</div>

      
      <div className="track-list">
        {topTracks.map((track, index) => (
          <div key={track.id} className="track">
            <div className="track-number">{index + 1}</div>
            <img src={track.album.images[0]?.url || 'https://via.placeholder.com/64'} alt={track.name} className="track-img" />
            
            <div className="track-info">
              <div className="track-title">{track.name}</div>
            </div>

            {track.preview_url ? (
              <CustomAudioPlayer previewUrl={track.preview_url} />
            ) : (
              <button onClick={() => window.open(`https://open.spotify.com/track/${track.id}`, '_blank')} className="open-in-spotify-btn">
                Open in Spotify
              </button>
            )}

            <div className="track-duration">
              {Math.floor(track.duration_ms / 60000)}:{((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CustomAudioPlayer = ({ previewUrl }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    const newProgress = (e.nativeEvent.offsetX / e.target.clientWidth) * audio.duration;
    audio.currentTime = newProgress;
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="custom-audio-player">
      <audio ref={audioRef} src={previewUrl} />
      <button onClick={togglePlayPause} className="play-pause-btn">
        {isPlaying ? 'Pause' : 'Play Preview'}
      </button>
      <div className="progress-bar" onClick={handleProgressClick}>
        <div className="progress-filled" style={{ width: `${progress}%` }} />
      </div>
      <div className="time-display">
        <span>{formatTime(currentTime)}</span> / <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default TopTracksView;
