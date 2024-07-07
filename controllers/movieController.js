import Movie from '../models/MovieModel.js'; // Adjust the path as needed
import User from '../models/UserModel.js';
import { v4 as uuidv4 } from 'uuid';
import admin from 'firebase-admin';

const bucket = admin.storage().bucket();

// Function to create a new movie
export const createMovie = async (req, res) => {
    try {
        const { userId, title, description, releaseYear, genre, rating, duration, language, country } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const originalname = req.file.originalname;
        const blob = bucket.file(`${userId}/${uuidv4()}_${originalname}`); // Store in user-specific path
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: req.file.mimetype
            }
        });

        blobStream.on('error', (err) => {
            console.error('Upload error:', err);
            res.status(500).json({ message: 'Could not upload file.' });
        });

        blobStream.on('finish', async () => {
            const imagePath = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

            const movie = new Movie({ 
                userId, 
                title, 
                description, 
                releaseYear, 
                genre, 
                rating, 
                duration, 
                language, 
                country, 
                imagePath 
            });

            await movie.save();
            res.status(201).json(movie);
        });

        blobStream.end(req.file.buffer);
    } catch (error) {
        console.error('Error creating movie:', error);
        res.status(500).json({ message: error.message, extraDetails: 'Error from Backend' });
    }
};

// Function to update an existing movie
export const updateMovie = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const movie = await Movie.findById(id);

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        if (movie.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this movie" });
        }

        if (req.file) {
            const originalname = req.file.originalname;
            const blob = bucket.file(`${req.user.id}/${uuidv4()}_${originalname}`); // Store in user-specific path
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype
                }
            });

            blobStream.on('error', (err) => {
                console.error('Upload error:', err);
                res.status(500).json({ message: 'Could not upload file.' });
            });

            blobStream.on('finish', async () => {
                const imagePath = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
                updateData.imagePath = imagePath;

                const updatedMovie = await Movie.findByIdAndUpdate(id, updateData, { new: true });

                res.status(200).json(updatedMovie);
            });

            blobStream.end(req.file.buffer);
        } else {
            const updatedMovie = await Movie.findByIdAndUpdate(id, updateData, { new: true });
            res.status(200).json(updatedMovie);
        }
    } catch (error) {
        console.error('Error updating movie:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Function to get all movies
export const getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find();
        res.status(200).json(movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Function to get a movie by ID
export const getMovieById = async (req, res) => {
    try {
        const { id } = req.params;
        const movie = await Movie.findById(id);

        if (!movie) {
            return res.status(404).json({ message: 'Movie not found' });
        }

        res.status(200).json(movie);
    } catch (error) {
        console.error('Error fetching movie:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Function to delete a movie
export const deleteMovie = async (req, res) => {
    try {
        const { id } = req.params;

        const movie = await Movie.findById(id);

        if (!movie) {
            return res.status(404).json({ message: "Movie not found" });
        }

        if (movie.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this movie" });
        }

        await Movie.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting movie:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};
