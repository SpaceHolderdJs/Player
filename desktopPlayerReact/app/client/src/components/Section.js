import React, { useState } from "react";
import Audio from "./Audio";

export default function Section(props) {
  const { name, tracks, audio } = props;
  const [value, setValue] = useState();

  const handleChane = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="song-section">
      <div className="r">
        <i class="material-icons prefix">search</i>
        <input
          type="text"
          className="search-input-songs"
          onChange={handleChane}
        />
      </div>
      {!value && tracks.map((e) => <Audio file={e} audio={audio} />)}

      {value &&
        tracks
          .filter((e) => e.name.includes(value))
          .map((e) => <Audio file={e} audio={audio} />)}
    </div>
  );
}
