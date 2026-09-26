import React, { useState, useEffect, createContext } from "react";
import { getUpcomingMovies } from "../api/tmdb-api";



export const MoviesContext = createContext();

const MoviesContextProvider = (props) => {
  const [favorites, setFavorites] = useState( [] )
  const [mustWatch, setMustWatch] = useState([]);
  const [myReviews, setMyReviews] = useState( {} ) 


 const addToFavorites = (movie) => {
  if (!favorites.find((fav) => fav.id === movie.id)) {
    setFavorites([...favorites, movie]);
  }
};



  const addToMustWatch = (movie) => {
  setMustWatch((prevMustWatch) => {
    if (!prevMustWatch.includes(movie.id)) {
      const updated = [...prevMustWatch, movie.id];
      console.log("Must Watch list:", updated);
      return updated;
    }
    return prevMustWatch;
  });
};


  
   const removeFromFavorites = (movie) => {
    setFavorites(favorites.filter((fav) => fav.id !== movie.id));
  };

  const [upcomingMovieIds, setUpcomingMovieIds] = useState([]);

useEffect(() => {
  getUpcomingMovies().then((data) => {
    const ids = data.results.map((movie) => movie.id);
    setUpcomingMovieIds(ids);
  });
}, []);



    const addReview = (movie, review) => {
    setMyReviews( {...myReviews, [movie.id]: review } )
  };
  console.log(myReviews);


  return (
    <MoviesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        addReview,
        upcomingMovieIds,
        mustWatch,
        addToMustWatch,
      }}
    >
      {props.children}
    </MoviesContext.Provider>
  );

};

export default MoviesContextProvider;
