import { useState } from "react";

export default function useMovieFilters() {
  const [titleFilter, setTitleFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("0");
  const [sortBy, setSortBy] = useState("rating"); // default sort

  const handleChange = (type, value) => {
    if (type === "name") {
      setTitleFilter(value);
    } else if (type === "genre") {
      setGenreFilter(value);
    } else if (type === "sort") {
      setSortBy(value);
    }
  };

  const filterMovies = (movies) => {
    let filtered = [...movies];

    
    if (titleFilter) {
      filtered = filtered.filter((m) =>
        m.title.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    
    if (genreFilter !== "0") {
      filtered = filtered.filter((m) =>
        m.genre_ids.includes(Number(genreFilter))
      );
    }
    

    
    if (sortBy === "rating") {
      filtered.sort((a, b) => b.vote_average - a.vote_average);
    } else if (sortBy === "date") {
      filtered.sort(
        (a, b) =>
          new Date(b.release_date || "1900-01-01") -
          new Date(a.release_date || "1900-01-01")
      );
    } else if (sortBy === "alphabetical") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    return filtered;
  };

  return {
    titleFilter,
    genreFilter,
    sortBy,
    handleChange,
    filterMovies,
  };
}

