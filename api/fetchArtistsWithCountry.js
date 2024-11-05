// populateArtistsByCountry.js
require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const Artist = require('./models/Artist');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

// Spotify API credentials
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Fetch access token from Spotify
async function getSpotifyAccessToken() {
  const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
    headers: {
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data.access_token;
}

// Fetch country list from countries-110m.json
async function fetchCountryList() {
  try {
    const response = await axios.get('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');
    const countries = response.data.objects.countries.geometries.map(
      (country) => country.properties.name
    );
    console.log(`Fetched ${countries.length} countries.`);
    return countries;
  } catch (error) {
    console.error('Error fetching country list:', error);
    return [];
  }
}

// Fetch artists by country or genre from Spotify
async function fetchArtistsByCountry(country, token) {
  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: `genre:"${country}"`, type: 'artist', limit: 50 },
    });
    return response.data.artists.items;
  } catch (error) {
    console.error(`Error fetching artists for country ${country}:`, error);
    return [];
  }
}

// Verify artist's country using Wikipedia
async function getCountryFromWikipedia(artistName) {
  try {
    const response = await axios.get(`https://en.wikipedia.org/w/api.php`, {
      params: {
        action: 'query',
        format: 'json',
        titles: artistName,
        prop: 'pageprops',
        ppprop: 'wikibase_item',
        redirects: 1,
      },
    });

    const pages = response.data.query.pages;
    const pageId = Object.keys(pages)[0];
    const wikidataId = pages[pageId].pageprops?.wikibase_item;

    if (!wikidataId) return null;

    const wikidataResponse = await axios.get(`https://www.wikidata.org/wiki/Special:EntityData/${wikidataId}.json`);
    const claims = wikidataResponse.data.entities[wikidataId].claims;

    const countryClaim = claims['P27']; // P27 is the Wikidata property for country of citizenship
    if (countryClaim && countryClaim[0]?.mainsnak?.datavalue?.value?.id) {
      const countryId = countryClaim[0].mainsnak.datavalue.value.id;
      const countryDataResponse = await axios.get(`https://www.wikidata.org/wiki/Special:EntityData/${countryId}.json`);
      return countryDataResponse.data.entities[countryId].labels.en.value;
    }
  } catch (error) {
    console.error(`Error fetching country for artist ${artistName}:`, error);
  }

  return null;
}

// Save unique artists to the database
async function saveArtistsToDatabase(artists, country) {
  for (const artist of artists) {
    // Check for existing artist by Spotify ID
    const existingArtist = await Artist.findOne({ spotifyId: artist.id });
    if (existingArtist) {
      console.log(`Artist already exists: ${artist.name}`);
      continue;
    }

    // Verify artist's country with Wikipedia
    const verifiedCountry = await getCountryFromWikipedia(artist.name) || country;

    const newArtist = new Artist({
      name: artist.name,
      spotifyId: artist.id,
      genres: artist.genres,
      imageUrl: artist.images[0]?.url,
      country: verifiedCountry,
    });

    try {
      await newArtist.save();
      console.log(`Saved artist: ${artist.name} from ${verifiedCountry}`);
    } catch (err) {
      console.error(`Error saving artist: ${artist.name}`, err);
    }
  }
}

// Main function to populate artists by country
async function populateArtistsByCountry() {
  const token = await getSpotifyAccessToken();
  const countries = await fetchCountryList(); // Fetch the list of countries

  for (const country of countries) {
    console.log(`Fetching artists for country: ${country}`);
    const artists = await fetchArtistsByCountry(country, token);
    await saveArtistsToDatabase(artists, country);
  }

  mongoose.connection.close();
}

populateArtistsByCountry();
