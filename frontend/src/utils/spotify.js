// utils/spotify.js
import axios from 'axios';

export async function getSpotifyAccessToken() {
  try {
    const response = await axios.get('http://localhost:5000/api/spotify-token'); // Call the backend API
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching access token from backend:', error);
    throw error;
  }
}