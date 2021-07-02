import React, { useState } from "react";
import Audio from "./Audio";

export default function Section(props) {
  const { name, tracks, audio } = props;

  const [more, setMore] = useState(false);

  return (
    <div className="song-section">
      {tracks.map((e) => (
        <Audio file={e} audio={audio} />
      ))}
    </div>
  );
}
