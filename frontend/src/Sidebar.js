// Sidebar.js
import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import TopTracksView from './TopTracksView';
import { getSpotifyAccessToken } from './utils/spotify';

const Sidebar = ({ country, artists, onClose }) => {
  const [category, setCategory] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [artistData, setArtistData] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const artistsPerPage = 20;
  const maxPageButtons = 3;

  useEffect(() => {
    async function fetchArtistPopularity() {
      const token = await getSpotifyAccessToken();
      const artistPromises = artists.map(async (artist) => {
        try {
          const response = await fetch(`https://api.spotify.com/v1/artists/${artist.spotifyId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const data = await response.json();
          return { ...artist, popularity: data.popularity };
        } catch (error) {
          console.error(`Error fetching data for ${artist.name}`, error);
          return artist; // Return artist without popularity if there's an error
        }
      });

      const artistData = await Promise.all(artistPromises);
      setArtistData(artistData);
    }

    fetchArtistPopularity();
  }, [artists]);

  // Reset selected artist whenever the country changes
  useEffect(() => {
    setSelectedArtist(null);
  }, [country]);

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    setCurrentPage(1);
  };

  const sortedArtists = React.useMemo(() => {
    if (category === 'popular') {
      return [...artistData].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (category === 'random') {
      return [...artistData].sort(() => Math.random() - 0.5);
    }
    return artistData;
  }, [artistData, category]);

  const totalPages = Math.ceil(sortedArtists.length / artistsPerPage);
  const indexOfLastArtist = currentPage * artistsPerPage;
  const indexOfFirstArtist = indexOfLastArtist - artistsPerPage;
  const currentArtists = sortedArtists.slice(indexOfFirstArtist, indexOfLastArtist);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const getPaginationGroup = () => {
    const pagination = [];
    if (totalPages <= maxPageButtons + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pagination.push(i);
      }
    } else {
      pagination.push(1);
      if (currentPage > 3) pagination.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pagination.push(i);
      }
      if (currentPage < totalPages - 2) pagination.push("...");
      pagination.push(totalPages);
    }
    return pagination;
  };

  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
  };

  const handleBack = () => {
    setSelectedArtist(null);
  };

  return (
    <div className="sidebar">
      <button className="close-btn" onClick={selectedArtist ? handleBack : onClose}>
        <FontAwesomeIcon icon={selectedArtist ? faArrowLeft : faXmark} />
      </button>

      <h2 className="country-title">{country}</h2>

      {selectedArtist ? (
        <TopTracksView artist={selectedArtist} onBack={handleBack} />
      ) : (
        <>
          <div className="category-selector">
            <button
              className={category === 'popular' ? 'active' : ''}
              onClick={() => handleCategoryChange('popular')}
            >
              Popular
            </button>
            <button
              className={category === 'random' ? 'active' : ''}
              onClick={() => handleCategoryChange('random')}
            >
              Random
            </button>
          </div>

          <div className="artist-container">
              {currentArtists.length > 0 ? (
                currentArtists.map((artist) => (
                  <div
                    className="artist-card"
                    key={artist._id}
                    onClick={() => handleArtistClick(artist)}
                  >
                    <img
                      src={artist.imageUrl || 'https://via.placeholder.com/150'}
                      alt={artist.name}
                      className="artist-img"
                    />
                    <p className="artist-name">{artist.name}</p>

                    
                    
                    {/* Render each genre as a button-like element */}
                    <div className="artist-genres">
                      {artist.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="genre-button"
                          onClick={(e) => e.stopPropagation()} // Prevent click event from bubbling up
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p>No artists found for this country.</p>
              )}
            </div>


          <div className="pagination">
            {currentPage > 1 && (
              <button className="pagination-btn" onClick={() => paginate(currentPage - 1)}>
                Previous
              </button>
            )}

            {getPaginationGroup().map((item, index) => (
              <button
                key={index}
                onClick={() => item !== "..." && paginate(item)}
                className={`pagination-btn ${currentPage === item ? 'active' : ''}`}
                disabled={item === "..."}
              >
                {item}
              </button>
            ))}

            {currentPage < totalPages && (
              <button className="pagination-btn" onClick={() => paginate(currentPage + 1)}>
                Next
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Sidebar;
