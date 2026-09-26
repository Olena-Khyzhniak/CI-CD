import React from "react";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import img from '../../images/pexels-dziana-hasanbekava-5480827.jpg';
import { getGenres } from "../../api/tmdb-api";
import { useQuery } from '@tanstack/react-query';
import Spinner from '../spinner';

const formControl = {
  margin: 1,
  minWidth: "90%",
  backgroundColor: "rgb(255, 255, 255)"
};

export default function FilterMoviesCard(props) {
  const { data, error, isPending, isError } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
  });

  if (isPending) return <Spinner />;
  if (isError) return <h1>{error.message}</h1>;

  const genres = data.genres;
  if (genres[0].name !== "All") {
    genres.unshift({ id: "0", name: "All" });
  }

  const handleChange = (e, type, value) => {
    e.preventDefault();
    props.onUserInput(type, value);
  };

  return (
    <Card
      sx={{
        width: 200,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: 7,
        borderRadius: 2,
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.03)",
        },
        backgroundColor: "#decfde99",
      }}
      variant="outlined"
    >
      <CardMedia
        component="img"
        sx={{ height: 220, objectFit: "cover" }}
        image={img}
        alt="Filter"
      />

      <CardContent sx={{ px: 2, py: 1 }}>
        <Typography
          variant="h6"
          component="p"
          align="center"
          sx={{ fontWeight: "bold", fontSize: "1rem", mb: 1 }}
        >
          <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />
          Filter the movies
        </Typography>

        <TextField
          sx={{ ...formControl }}
          id="filled-search"
          label="Search"
          type="search"
          variant="filled"
          value={props.titleFilter}
          onChange={(e) => handleChange(e, "name", e.target.value)}
        />

        <FormControl sx={{ ...formControl }}>
          <InputLabel id="genre-label">Genre</InputLabel>
          <Select
            labelId="genre-label"
            id="genre-select"
            value={props.genreFilter || "0"}
            onChange={(e) => handleChange(e, "genre", e.target.value)}
          >
            {genres.map((genre) => (
              <MenuItem key={genre.id} value={genre.id}>
                {genre.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ ...formControl }}>
          <InputLabel id="sort-label">Sort By</InputLabel>
          <Select
            labelId="sort-label"
            id="sort-select"
            value={props.sortBy || "rating"}
            onChange={(e) => handleChange(e, "sort", e.target.value)}
          >
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="date">Release Date</MenuItem>
            <MenuItem value="alphabetical">Alphabetical</MenuItem>
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  );
}
