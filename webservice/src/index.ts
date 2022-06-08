import express, {Request, Response} from 'express';
import fs from 'fs';
import axios from 'axios';
import {Movie, SearchResults} from "./types";

const app = express();
const port = 3000;
let api_key: string;

fs.readFile('./api-key.txt', 'utf8', function (err,data) {
	if (err) {
		return console.log(err);
	}
	api_key = data;
});

async function getMovies(search: string): Promise<SearchResults | string> {
	console.log(`Retrieving movies for search: ${search}`);
	const params = {
		api_key,
		language: 'en-US',
		query: search,
		page: 1,
		include_adult: false
	};
	try {
		// 👇️ const data: GetUsersResponse
		const { data } = await axios.get<any>(
			`https://api.themoviedb.org/3/search/movie`,
			{
				params,
				headers: {
					Accept: 'application/json',
				},
			},
		);
		return data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			console.log('error message: ', error.message);
			return error.message;
		} else {
			console.log('unexpected error: ', error);
			return 'An unexpected error occurred';
		}
	}
}

app.get('/movies', async function(req: Request, res: Response) {
	const data = await getMovies(req.query['search'] as string),
		results = (data as SearchResults)?.results;
	if (Array.isArray(results)) {
		let movies: Movie[];
		if (results.length > 10) {
			movies = results.slice(0, 10);
		} else {
			movies = results;
		}
		res.send(movies.map(movie => ({
			movie_id: movie.id,
			title: movie.title,
			poster_image_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
			popularity_summary: `${movie.popularity} out of ${movie.vote_count}`
		})));
	} else if (typeof data === 'string') {
		res.status(500).send(data);
	} else {
		res.status(500).send();
	}
});

app.listen(port, () => {
	console.log(`Movie app listening at http://localhost:${port}`)
});