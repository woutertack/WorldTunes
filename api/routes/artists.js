// routes/artists.js
const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');

// GET all artists
router.get('/', async (req, res) => {
  try {
    const artists = await Artist.find();
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new artist
router.post('/', async (req, res) => {
  const artist = new Artist({
    name: req.body.name,
    country: req.body.country,
    genres: req.body.genres,
    imageUrl: req.body.imageUrl,
  });

  try {
    const newArtist = await artist.save();
    res.status(201).json(newArtist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET a single artist by ID
router.get('/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT to update an artist by ID
router.put('/:id', async (req, res) => {
  try {
    const artist = await Artist.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json(artist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an artist by ID
router.delete('/:id', async (req, res) => {
  try {
    const artist = await Artist.findByIdAndDelete(req.params.id);
    if (!artist) return res.status(404).json({ message: 'Artist not found' });
    res.json({ message: 'Artist deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET artists by country
router.get('/country/:country', async (req, res) => {
  try {
    const country = req.params.country;
    const artists = await Artist.find({ country: country });
    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
