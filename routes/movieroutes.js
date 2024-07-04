import express from 'express';
import { createMovie, getAllMovies, updateMovie, deleteMovie,getMovieById,getUserMovies } from '../controllers/movieController.js'; // Adjust the path as needed
import { authMiddleware } from '../middlewares/auth-middleware.js';



const router = express.Router();

router.post('/',authMiddleware, createMovie);
router.get('/', getAllMovies);
router.put('/:id',authMiddleware, updateMovie); // Update movie by ID
router.delete('/:id',authMiddleware, deleteMovie); // Delete movie by ID
router.get("/:userId/movies", getUserMovies); // user movies
router.get("/:id",getMovieById);
// Route to get movies associated with a specific user
//router.get('/user/:id/movies',getUserMovies);

export default router;

