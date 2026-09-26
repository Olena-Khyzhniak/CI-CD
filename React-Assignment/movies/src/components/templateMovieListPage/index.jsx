import React, { useState } from "react";
import Header from "../headerMovieList";
import FilterCard from "../filterMoviesCard";
import MovieList from "../movieList";
import Grid from "@mui/material/Grid";

function MovieListPageTemplate({ movies, title, action }) {
  const [nameFilter, setNameFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("0");
  const [sortBy, setSortBy] = useState("rating");
  const genreId = Number(genreFilter);

  let displayedMovies = movies
    .filter((m) => {
      return m.title.toLowerCase().search(nameFilter.toLowerCase()) !== -1;
    })
    .filter((m) => {
      return genreId > 0 ? m.genre_ids.includes(genreId) : true;
    });


 if (sortBy === "rating") {
    displayedMovies.sort((a, b) => b.vote_average - a.vote_average);
  } else if (sortBy === "date") {
    displayedMovies.sort(
      (a, b) =>
        new Date(b.release_date || "1900-01-01") -
        new Date(a.release_date || "1900-01-01")
    );
  } else if (sortBy === "alphabetical") {
    displayedMovies.sort((a, b) => a.title.localeCompare(b.title));
  }


  const handleChange = (type, value) => {
    if (type === "name") setNameFilter(value);
    else if (type === "genre") setGenreFilter(value);
    else if (type === "sort") setSortBy(value);
  };

  return (
    <Grid container>
      <Grid size={12}>
        <Header title={title} />
      </Grid>
      <Grid container sx={{flex: "1 1 500px"}}>
        <Grid 
          key="find" 
          size={{xs: 12, sm: 6, md: 4, lg: 3, xl: 2}} 
          sx={{padding: "20px"}}
        >
          <FilterCard
            onUserInput={handleChange}
            titleFilter={nameFilter}
            genreFilter={genreFilter}
            sortBy={sortBy}
          />
        </Grid>
                <MovieList action={action} movies={displayedMovies}></MovieList>

      </Grid>
    </Grid>
  );
}
export default MovieListPageTemplate;
