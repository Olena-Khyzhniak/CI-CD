import React, { useContext } from "react";
import PageTemplate from "../components/templateMovieListPage";
import { MoviesContext } from "../contexts/moviesContext";
import Spinner from "../components/spinner";
import RemoveFromFavorites from "../components/cardIcons/removeFromFavorites";
import WriteReview from "../components/cardIcons/writeReview";

const FavoriteMoviesPage = () => {
  const { favorites } = useContext(MoviesContext); // теперь это массив фильмов

  if (!favorites || favorites.length === 0) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>No favorite movies yet.</p>;
  }

  // Защита от некорректных объектов
  const validMovies = favorites.filter((movie) => movie && movie.id);

  if (validMovies.length === 0) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>No valid movie data available.</p>;
  }

  return (
    <PageTemplate
      title="Favorite Movies"
      movies={validMovies}
      action={(movie) => (
        <>
          <RemoveFromFavorites movie={movie} />
          <WriteReview movie={movie} />
        </>
      )}
    />
  );
};

export default FavoriteMoviesPage;
