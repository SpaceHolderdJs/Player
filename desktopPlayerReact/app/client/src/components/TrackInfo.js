import React, { useState, useEffect } from "react";

export default function TrackInfo(props) {
  const [info, setInfo] = useState();

  useEffect(() => {
    if (!info) {
      fetch(
        "https://shazam.p.rapidapi.com/search?term=kiss%20the%20rain&locale=en-US&offset=0&limit=5",
        {
          method: "GET",
          headers: {
            "x-rapidapi-key":
              "2ecc6a18f1msh149a8c93469a116p1ff3e3jsn92ea038f0326",
            "x-rapidapi-host": "shazam.p.rapidapi.com",
          },
        }
      )
        .then((response) => response.json)
        .then((info) => {
          setInfo(info);
          if (info && Object.keys(info).length > 0) {
            fetch();
          }
        });
    }
  });

  return (
    <div className="section">
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
          <i className="material-icons large">cloud-off</i>
        </div>
      )}
      {info && Object.keys(info).length < 0 && (
        <div className="r">
          <div className="col"></div>
          <div className="col"></div>
        </div>
      )}
    </div>
  );
}
