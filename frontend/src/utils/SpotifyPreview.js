import React from 'react';

const SpotifyPreview = ({ trackUri }) => {
  return (
    <iframe
      src={`https://open.spotify.com/embed/track/${trackUri}`}
      width="300"
      height="80"
      frameBorder="0"
      allowtransparency="true"
      allow="encrypted-media"
      title="Spotify Preview Player"
    ></iframe>
  );
};

export default SpotifyPreview;
