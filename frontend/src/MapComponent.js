import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import './MapComponent.css';
import Logo from './Logo';

// World TopoJSON data
const geoUrl =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const MapComponent = ({ onSelectCountry }) => {
  // State to track the selected country
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleCountryClick = (geo) => {
    const countryName = geo.properties.NAME || geo.properties.name;
    if (countryName) {
      setSelectedCountry(countryName); // Set the selected country
      onSelectCountry(countryName); // Notify parent component
    }
  };

  return (
    <ComposableMap
      projection="geoEqualEarth"
      width={850}
      height={600}
      projectionConfig={{
        scale: 175, // Adjust scale if needed to make the map more visible
        center: [20, -20], // Change the center coordinates, adjusting this moves the map vertically
      }}
      style={{ width: '100%', height: '85%' }}
      disablePanning={true}
    >
      <Geographies geography={geoUrl}>
        {({ geographies }) =>
          geographies.map((geo) => {
            const countryName = geo.properties.NAME || geo.properties.name;
            const isSelected = selectedCountry === countryName; // Check if this country is selected

            return (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                onClick={() => handleCountryClick(geo)}
                style={{
                  default: {
                    fill: isSelected ? '#1ED760' : '#2c2c2c', // Apply color based on selection
                    outline: 'none',
                  },
                  hover: {
                    fill: '#1ED760',
                    outline: 'none',
                  },
                  pressed: {
                    fill: '#1ED760',
                    outline: 'none',
                  },
                }}
              />
            );
          })
        }
      </Geographies>
   
    </ComposableMap>
  );
};

export default MapComponent;
