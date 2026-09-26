import React from "react";
import { useQuery } from "@tanstack/react-query";
import MovieListPageTemplate from "../components/templateMovieListPage";
import Spinner from "../components/spinner";
import { getUpcomingMovies } from "../api/tmdb-api";
import AddToPlaylistIcon from "../components/cardIcons/addToPlaylistIcon";



const UpcomingMoviesPage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["upcoming"],
    queryFn: getUpcomingMovies,
  });

  if (isLoading) return <Spinner />;
  if (isError) {
    console.error("Error fetching upcoming movies:", error.message);
    return <p>Error loading upcoming movies.</p>;
  }

  return (
    <MovieListPageTemplate
      title="Upcoming Movies"
      movies={data.results}
      action={(movie) => <AddToPlaylistIcon movie={movie} />}
    />
  );
};

export default UpcomingMoviesPage;
