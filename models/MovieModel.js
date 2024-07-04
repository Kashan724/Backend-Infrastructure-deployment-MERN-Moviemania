import mongoose from 'mongoose';
import User from './UserModel.js'

const movieSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
      },
    title: { type: String, required: true },
    description: { type: String, required: true },
    releaseYear: { type: Number, required: true },
    genre: [{ type: String }],
    rating: { type: String },
    duration: { type: String },
    language: { type: String },
    country: { type: String },
    imagePath: { type: String}// Store path to uploaded image, required for poster/banner
    
});

const Movie = mongoose.model('Movie', movieSchema);
export default Movie;
 