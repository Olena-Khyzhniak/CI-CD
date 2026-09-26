import React from "react";
import { Card, CardMedia, CardContent, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";

const CastList = ({ cast }) => {
  if (!cast || cast.length === 0) return <p>No cast info.</p>;

  return (
    <Box sx={{ display: "flex", gap: 2, overflowX: "auto", paddingY: 1 }}>
      {cast.map((actor) => (
        <Link
          to={`/actors/${actor.id}`}
          key={actor.id}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Card
            sx={{
              minWidth: 150,
              maxWidth: 150,
              height: 300,
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
            <CardMedia
              component="img"
              sx={{ height: 200, objectFit: "cover" }}
              image={
                actor.profile_path
                  ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                  : "https://via.placeholder.com/200x300?text=No+Image"
              }
              alt={actor.name}
            />
            <CardContent sx={{ px: 1, py: 1 }}>
              <Typography
                variant="subtitle1"
                align="center"
                sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
              >
                {actor.name}
              </Typography>
              <Typography
                variant="body2"
                align="center"
                color="text.secondary"
              >
                {actor.character}
              </Typography>
            </CardContent>
          </Card>
        </Link>
      ))}
    </Box>
  );
};

export default CastList;
