import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationIcon from "@mui/icons-material/MonetizationOn";
import StarRateIcon from "@mui/icons-material/StarRate";
import NavigationIcon from "@mui/icons-material/Navigation";
import Fab from "@mui/material/Fab";
import Drawer from "@mui/material/Drawer";
import { useQuery } from "@tanstack/react-query";
import { getMovieCredits, getMovieRecommendations } from "../../api/tmdb-api";
import MovieReviews from "../movieReviews";
import CastList from "../castList";
import Recommendations from "../recommendations";

const chip = { margin: 0.5 };
const root = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  listStyle: "none",
  padding: 1.5,
  margin: 0,
  gap: 1,
};

const MovieDetails = ({ movie }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { id } = movie;

  const { data: credits } = useQuery({
    queryKey: ["credits", { id }],
    queryFn: getMovieCredits,
  });

  const { data: recommendations } = useQuery({
    queryKey: ["recommendations", { id }],
    queryFn: getMovieRecommendations,
  });

  return (
    <Box sx={{ padding: "2rem" }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
        {movie.title}
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        {movie.overview}
      </Typography>

      <Paper component="ul" sx={{ ...root, mb: 2 }}>
        <li>
          <Chip label="Genres" sx={chip} color="primary" />
        </li>
        {movie.genres.map((g) => (
          <li key={g.name}>
            <Chip label={g.name} sx={chip} />
          </li>
        ))}
      </Paper>

      <Paper component="ul" sx={{ ...root, mb: 2 }}>
        <Chip icon={<AccessTimeIcon />} label={`${movie.runtime} min.`} sx={chip} />
        <Chip icon={<MonetizationIcon />} label={`${movie.revenue.toLocaleString()}`} sx={chip} />
        <Chip icon={<StarRateIcon />} label={`${movie.vote_average} (${movie.vote_count})`} sx={chip} />
        <Chip label={`Released: ${movie.release_date}`} sx={chip} />
      </Paper>

      <Paper component="ul" sx={{ ...root, mb: 2 }}>
        <li>
          <Chip label="Production Countries" sx={chip} color="primary" />
        </li>
        {movie.production_countries.map((country) => (
          <li key={country.iso_3166_1}>
            <Chip label={country.name} sx={chip} />
          </li>
        ))}
      </Paper>

      {credits && (
        <>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            Cast
          </Typography>
          <CastList cast={credits.cast.slice(0, 10)} />
        </>
      )}

      {recommendations && (
        <>
          <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
            Recommendations
          </Typography>
          <Recommendations movies={recommendations.results.slice(0, 5)} />
        </>
      )}

      <Fab
        color="secondary"
        variant="extended"
        onClick={() => setDrawerOpen(true)}
        sx={{
          position: "fixed",
          bottom: "1em",
          right: "1em",
          zIndex: 10,
        }}
      >
        <NavigationIcon />
        Reviews
      </Fab>

      <Drawer anchor="top" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <MovieReviews movie={movie} />
      </Drawer>
    </Box>
  );
};

export default MovieDetails;
