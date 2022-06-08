export interface SearchResults {
	page: number;
	results: Movie[];
}

export interface Movie {
	id: number;
	title: string;
	poster_path: string;
	popularity: number;
	vote_count: number;
}