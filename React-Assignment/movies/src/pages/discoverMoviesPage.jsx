import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getDiscoverMovies } from "../api/tmdb-api";
import Spinner from "../components/spinner";
import MovieListPageTemplate from "../components/templateMovieListPage";

const DiscoverMoviesPage = () => {
  const { data, error, isPending, isError } = useQuery({
    queryKey: ["discover"],
    queryFn: getDiscoverMovies,
  });

  if (isPending) {
    return <Spinner />;
  }

  if (isError) {
    return <h1>{error.message}</h1>;
  }

  const movies = data.results;

  return (
    <MovieListPageTemplate
      title="Discover Movies"
      movies={movies}
      action={(movie) => null}
    />
  );
};

export default DiscoverMoviesPage;
