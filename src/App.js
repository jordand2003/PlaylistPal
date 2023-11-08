import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function App() {
  const CLIENT_ID = "8dc9260ae2344d71ae4b756b78b70976";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = React.useState("");

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.localStorage.hash = "";
      window.localStorage.setItem("token", token);
      setToken(token);
    }
  });

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  return (
    <div>
      <header>
        <h1>Playlist Pal</h1>
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
          >
            Log in to Spotify
          </a>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </header>
    </div>
  );
}
