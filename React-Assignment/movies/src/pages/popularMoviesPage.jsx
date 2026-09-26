import React from "react";
import { useQuery } from "@tanstack/react-query";
import MovieListPageTemplate from "../components/templateMovieListPage";
import Spinner from "../components/spinner";
import { getPopularMovies } from "../api/tmdb-api";
import AddToPlaylistIcon from "../components/cardIcons/addToPlaylistIcon";



const PopularMoviesPage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["popular"],
    queryFn: getPopularMovies,
  });

  if (isLoading) return <Spinner />;
  if (isError) {
    console.error("Error fetching popular movies:", error.message);
    return <p>Error loading popular movies.</p>;
  }

  return (
    <MovieListPageTemplate
      title="Popular Movies"
      movies={data.results}
      action={(movie) => <AddToPlaylistIcon movie={movie} />}
    />
  );
};

export default PopularMoviesPage;
