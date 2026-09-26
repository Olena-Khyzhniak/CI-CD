import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getActorDetails, getActorsMovies } from "../api/tmdb-api";
import ActorDetails from "../components/actorDetails";
import Spinner from "../components/spinner";

const ActorPage = () => {
  const { id } = useParams();

  const { data: actor, isLoading: actorLoading } = useQuery({
    queryKey: ["actor-details", { id }],
    queryFn: getActorDetails,
  });

  const { data: moviesData, isLoading: moviesLoading } = useQuery({
    queryKey: ["actor-movies", { id }],
    queryFn: getActorsMovies,
  });

  if (actorLoading || moviesLoading) return <Spinner />;
  if (!actor) return <p>Actor not found</p>;

  return <ActorDetails actor={actor} movies={moviesData?.cast || []} />;
};

export default ActorPage;
