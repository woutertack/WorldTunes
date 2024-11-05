// models/Artist.js
const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  spotifyId: { type: String, required: true },
  genres: [String],
  imageUrl: String,
  country: String, // Country of origin
});

module.exports = mongoose.model('Artist', artistSchema);
