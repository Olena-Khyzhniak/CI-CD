import React from "react";
import { useQuery } from "@tanstack/react-query";
import MovieListPageTemplate from "../components/templateMovieListPage";
import Spinner from "../components/spinner";
import { getTopRatedMovies } from "../api/tmdb-api";
import AddToPlaylistIcon from "../components/cardIcons/addToPlaylistIcon";



const TopRatedPage = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["topRated"],
    queryFn: getTopRatedMovies,
  });

  if (isLoading) return <Spinner />;
  if (isError) {
    console.error("Error fetching top rated movies:", error.message);
    return <p>Error loading top rated movies.</p>;
  }

  return (
    <MovieListPageTemplate
      title="Top Rated Movies"
      movies={data.results}
      action={(movie) => <AddToPlaylistIcon movie={movie} />}
    />
  );
};

export default TopRatedPage;
