import React, { useState, useEffect } from "react";

export default function TrackInfo(props) {
  const { songName } = props;
  const [info, setInfo] = useState();

  useEffect(() => {
    console.log("___", songName);
    if (!info) {
      fetch(
        `https://shazam.p.rapidapi.com/search?term=${songName}&locale=en-US&offset=0&limit=5`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-key":
              "2ecc6a18f1msh149a8c93469a116p1ff3e3jsn92ea038f0326",
            "x-rapidapi-host": "shazam.p.rapidapi.com",
          },
        }
      )
        .then((response) => response.json())
        .then((info) => {
          setInfo(info);
          // if (info && Object.keys(info).length > 0) {
          //   fetch();
          // }
        });
    }
  });

  return (
    <div className="r centr">
      {!info && (
        <div className="c centr">
          <span>Loading...</span>
          <div className="progress">
            <div class="indeterminate"></div>
          </div>
        </div>
      )}
      {info && Object.keys(info).length === 0 && (
        <div className="c centr">
          <span>No info for current track</span>
          <i className="material-icons large">cloud_off</i>
        </div>
      )}
      {info && Object.keys(info).length > 1 && (
        <div className="r centr">
          <div className="c centr">
            <h5>{info.tracks.hits[0].track.title}</h5>
            <h6>{info.tracks.hits[0].track.subtitle}</h6>
            <img
              width={200}
              height={200}
              src={info.tracks.hits[0].track.images.coverart}
              alt={info.tracks.hits[0].track.title}
            />
          </div>
          <div className="c centr">
            <h5>{info.artists.hits[0].artist.name}</h5>
            <img
              src={info.artists.hits[0].artist.avatar}
              alt={info.artists.hits[0].artist.name}
              width={200}
              height={200}
            />
            <a href={info.tracks.hits[0].url} className="btn waves-effect">
              More on Shazam
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
