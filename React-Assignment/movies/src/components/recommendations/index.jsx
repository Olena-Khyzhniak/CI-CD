import React, { useContext } from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { Link } from "react-router-dom";
import { MoviesContext } from "../../contexts/moviesContext";
import img from "../../images/film-poster-placeholder.png";

export default function Recommendations({ movies }) {
  const { favorites, addToFavorites } = useContext(MoviesContext);

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
      {movies.map((movie) => {
        const isFavorite = favorites.includes(movie.id);

        return (
          <Card
            key={movie.id}
            sx={{
              width: 220,
              height: 420,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: 3,
              borderRadius: 2,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.03)",
              },
            }}
          >
            <CardContent sx={{ px: 2, py: 1 }}>
              <Typography
                variant="h6"
                align="center"
                sx={{ fontWeight: "bold", fontSize: "1rem" }}
              >
                {movie.title}
              </Typography>
            </CardContent>


           <Link to={`/movies/${movie.id}`}>
            <CardMedia
              component="img"
              sx={{ height: 300, objectFit: "cover" }}
              image={
                movie.poster_path
                  ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                  : img
              }
              alt={movie.title}
            />
            </Link>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, pb: 1 }}>
              <IconButton
                onClick={() => addToFavorites(movie)}
                color={isFavorite ? "error" : "primary"}
              >
                <FavoriteIcon />
              </IconButton>

              <Link to={`/movies/${movie.id}`}>
                <Button variant="outlined" size="small" color="primary">
                  More Info
                </Button>
              </Link>
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}
