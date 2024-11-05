import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapComponent from './MapComponent';
import Sidebar from './Sidebar';
import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const App = () => {
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [artists, setArtists] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true); // Start with sidebar open

  const handleCountrySelect = (country) => {
    console.log('Selected country:', country); 
    setSelectedCountry(country);
    setSidebarOpen(true); // Open the sidebar when a country is selected
  };

  // Fetch artists when the selectedCountry changes
  useEffect(() => {
    const fetchArtistsByCountry = async () => {
      console.log('Fetching artists for country:', selectedCountry);
      if (selectedCountry) {
        try {
          const response = await axios.get(`https://worldtunes.onrender.com/api/artists/country/${selectedCountry}`);
          setArtists(response.data);
        } catch (error) {
          console.error('Error fetching artists:', error);
        }
      }
    };
    
    fetchArtistsByCountry();
  }, [selectedCountry]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen); // Toggle sidebar open/closed state
  };

  return (
    <div className="app">
      <div className="content">
        <MapComponent onSelectCountry={handleCountrySelect} />
        
        {/* Sidebar or arrow to open it */}
        {selectedCountry && (
          <>
            {isSidebarOpen ? (
              <Sidebar
                country={selectedCountry}
                artists={artists}
                onClose={toggleSidebar}
              />
            ) : (
              <button className="open-sidebar-btn" onClick={toggleSidebar}>
                 <FontAwesomeIcon icon={faArrowLeft} />
              </button>
            )}
          </>
        )}
        <img src="logo.png" alt="Logo" className="logo" />
      </div>
    </div>
  );
};

export default App;
