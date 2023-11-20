import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const CLIENT_ID = "63364e9f707f4451b254e9de4459c7b4";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
  const RESPONSE_TYPE = "token";
  const SCOPE = "user-read-recently-played user-top-read";

  const [token, setToken] = useState("");
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [topShortArtists, setTopShortArtists] = useState([]);
  const [topMediumArtists, setTopMediumArtists] = useState([]);
  const [topLongArtists, setTopLongArtists] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      const newToken = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      const expiresIn = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("expires_in"))
        .split("=")[1];

      console.log(newToken);
      window.location.hash = "";
      window.localStorage.setItem("token", newToken);
      window.localStorage.setItem("expiresIn", expiresIn);

      setToken(newToken);
    } else {
      // Check if there's a stored token
      const storedToken = window.localStorage.getItem("token");
      const expiresIn = window.localStorage.getItem("expiresIn");

      if (storedToken && expiresIn) {
        const expirationTime = new Date(Number(expiresIn));
        const currentTime = new Date();

        // If the token is still valid, set it in the state
        if (expirationTime > currentTime) {
          setToken(storedToken);
        } else {
          // If the token has expired, refresh it
          refreshAccessToken();
        }
      }
    }
  }, []);

  const refreshAccessToken = async () => {
    const refreshToken = window.localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        const response = await axios.post(
          TOKEN_ENDPOINT,
          `grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${CLIENT_ID}`,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );

        const newToken = response.data.access_token;
        const expiresIn = response.data.expires_in;

        console.log("Refreshed token:", newToken);

        window.localStorage.setItem("token", newToken);
        window.localStorage.setItem("expiresIn", expiresIn);

        setToken(newToken);
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }
  };

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("expiresIn");
  };

  const fetchRecentlyPlayed = async () => {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/player/recently-played",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: "15",
          },
        }
      );
      setRecentlyPlayed(response.data.items);
    } catch (error) {
      console.error("Error fetching recently played tracks:", error);
    }
  };

  const fetchTopShortArtists = async () => {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/artists",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            time_range: "short_term",
            limit: 10,
          },
        }
      );
      setTopShortArtists(response.data.items);
    } catch (error) {
      console.error("Error fetching top artists:", error);
    }
  };
  const fetchTopMediumArtists = async () => {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/artists",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            time_range: "medium_term",
            limit: 10,
          },
        }
      );
      setTopMediumArtists(response.data.items);
    } catch (error) {
      console.error("Error fetching top artists:", error);
    }
  };
  const fetchTopLongArtists = async () => {
    try {
      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/artists",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            time_range: "long_term",
            limit: 10,
          },
        }
      );
      setTopLongArtists(response.data.items);
    } catch (error) {
      console.error("Error fetching top artists:", error);
    }
  };

  useEffect(() => {
    if (token) {
      console.log(recentlyPlayed);
      fetchRecentlyPlayed();
      console.log(topShortArtists);
      fetchTopShortArtists();
    }
  }, [token]);

  return (
    <div className="app">
      <h1 className="title">Playlist Buddy!</h1>
      {!token && (
        <p className="desc">
          Please connect your spotify account to access features such as viewing
          your recntly played songs, top artists, and custom created playlists!
        </p>
      )}
      {!token ? (
        <a
          className="log"
          href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`}
        >
          Login to Spotify
        </a>
      ) : (
        <button className="log" onClick={logout}>
          Logout
        </button>
      )}

      {token ? (
        <ul className="song-list">
          <p className="subtitle">Your Recently Listened to Songs</p>
          {recentlyPlayed.map((song) => (
            <div className="recent-songs">
              <li className="single-song" key={song.track.id}>
                <img
                  className="album-cover"
                  src={song.track.album.images[0].url}
                />
                <h2 className="song-title">{song.track.name}</h2>
              </li>
            </div>
          ))}{" "}
        </ul>
      ) : (
        <p></p>
      )}
      <div>
        {token ? <h1>Your Top Artists</h1> : <p></p>}
        {token ? (
          <div>
            <h3 className="subtitle">3 Months</h3>
            <ul className="song-list">
              {topShortArtists.map((artist) => (
                <div className="recent-songs" key={artist.id}>
                  <li className="single-song">
                    <img
                      className="album-cover"
                      src={artist.images[0].url}
                      alt={artist.name}
                    />
                    <h2 className="song-title">{artist.name}</h2>
                  </li>
                </div>
              ))}
            </ul>
          </div>
        ) : (
          <p></p>
        )}
        {token ? (
          <div>
            <h3 className="subtitle">6 Months</h3>
            <ul className="song-list">
              {topMediumArtists.map((artist) => (
                <div className="recent-songs" key={artist.id}>
                  <li className="single-song">
                    <img
                      className="album-cover"
                      src={artist.images[0].url}
                      alt={artist.name}
                    />
                    <h2 className="song-title">{artist.name}</h2>
                  </li>
                </div>
              ))}
            </ul>
          </div>
        ) : (
          <p></p>
        )}
        {token ? (
          <div>
            <h3 className="subtitle">12 Months</h3>
            <ul className="song-list">
              {topLongArtists.map((artist) => (
                <div className="recent-songs" key={artist.id}>
                  <li className="single-song">
                    <img
                      className="album-cover"
                      src={artist.images[0].url}
                      alt={artist.name}
                    />
                    <h2 className="song-title">{artist.name}</h2>
                  </li>
                </div>
              ))}
            </ul>
          </div>
        ) : (
          <p></p>
        )}
      </div>
    </div>
  );
};

export default App;