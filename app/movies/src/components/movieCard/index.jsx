//import React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardHeader from "@mui/material/CardHeader";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CalendarIcon from "@mui/icons-material/CalendarTodayTwoTone";
import StarRateIcon from "@mui/icons-material/StarRate";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import img from '../../images/film-poster-placeholder.png'
import { Link } from "react-router-dom";
import Avatar from '@mui/material/Avatar';
import React, { useContext  } from "react";
import { MoviesContext } from "../../contexts/moviesContext";
import Box from "@mui/material/Box";






export default function MovieCard({ movie, action }) {

 const { favorites, addToFavorites, removeFromFavorites } = useContext(MoviesContext);

  const isFavorite = favorites.some((fav) => fav.id === movie.id);

  const handleToggleFavorite = (e) => {
  e.preventDefault();
  if (isFavorite) {
    removeFromFavorites(movie);
  } else {
    addToFavorites(movie);
  }
};

 



  return (
   <Card
  sx={{
    width: 220,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    boxShadow: 7,
    borderRadius: 2,
    transition: "transform 0.2s",
    "&:hover": {
      transform: "scale(1.03)",
    },
  }}
>

            <CardHeader
        avatar={
          isFavorite ? (
            <Avatar sx={{ backgroundColor: 'red' }}>
              <FavoriteIcon />
            </Avatar>
          ) : null
        }
       title={
      <Typography
      variant="h6"
      component="p"
      align="center"
      sx={{ fontWeight: "bold", fontSize: "1rem", paddingX: 1 }}
    >
      {movie.title}
    </Typography>
  }
      />

    <Link to={`/movies/${movie.id}`}>
    <CardMedia
  component="img"
  sx={{ height: 300, objectFit: "cover" }}
  image={
    movie.poster_path
      ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
      : img
  }
/>
</Link>



      <CardContent sx={{ px: 2, py: 1 }}>
  <Box sx={{ backgroundColor: "#decfde99", borderRadius: 1, padding: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
    <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <CalendarIcon fontSize="small" />
      {movie.release_date || "—"}
    </Typography>
    <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <StarRateIcon fontSize="small" />
      {movie.vote_average || "—"}
    </Typography>
  </Box>
</CardContent>


        <CardActions sx={{ justifyContent: "center", pb: 1 }}>
   <IconButton onClick={handleToggleFavorite} color={isFavorite ? "error" : "primary"}>
    <FavoriteIcon />
  </IconButton>

  <Link to={`/movies/${movie.id}`}>
    <Button variant="outlined" size="small" color="primary">
      More Info
    </Button>
  </Link>
</CardActions>

    </Card>
  );
}
