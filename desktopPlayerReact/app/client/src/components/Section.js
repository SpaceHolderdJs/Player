import React, { useState } from "react";
import Audio from "./Audio";
import AudioStudio from "./AudioStudio";

export default function Section(props) {
  const { name, tracks, audio, setPlaying, initProcessingFiles } = props;
  const [value, setValue] = useState();

  const handleChane = (e) => {
    setValue(e.target.value);
    console.log("!!!", tracks);
  };

  return (
    <div className="song-section">
      <div className="r">
        <i className="material-icons ">search</i>
        <input
          type="text"
          className="search-input-songs"
          onChange={handleChane}
        />
      </div>
      {!value &&
        tracks.map((e) =>
          !initProcessingFiles ? (
            <Audio file={e} audio={audio} setPlaying={setPlaying} />
          ) : (
            <AudioStudio file={e} initProcessingFiles={initProcessingFiles} />
          )
        )}

      {value &&
        tracks
          .filter((e) => e.name.includes(value))
          .map((e) =>
            !initProcessingFiles ? (
              <Audio file={e} audio={audio} setPlaying={setPlaying} />
            ) : (
              <AudioStudio file={e} initProcessingFiles={initProcessingFiles} />
            )
          )}
    </div>
  );
}
