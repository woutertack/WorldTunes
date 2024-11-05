import axios from 'axios';

// Replace these values with your Spotify Client ID and Client Secret
const CLIENT_ID = 'fe705e49bbaa41299228ebffb667fe4e';
const CLIENT_SECRET = '1199060977f94950bc1c90d45f0c744e';

// Function to get Spotify API token
const getToken = async () => {
  const result = await axios('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET),
    },
    data: 'grant_type=client_credentials',
  });

  return result.data.access_token;
};

// Function to search for artists using Spotify API
export const searchArtist = async (query) => {
  const token = await getToken();
  const result = await axios(`https://api.spotify.com/v1/search`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
    params: {
      q: query,
      type: 'artist',
    },
  });

  return result.data.artists.items; // Returns an array of artist objects
};
