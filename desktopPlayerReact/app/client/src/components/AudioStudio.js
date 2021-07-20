import React, { useState, useEffect } from "react";

export default function AudioStudio(props) {
  const { file, initProcessingFiles } = props;

  return (
    <div className="Audio r">
      {file.name}
      <i
        className="material-icons"
        onClick={() => {
          initProcessingFiles(file);
        }}>
        edit
      </i>
    </div>
  );
}
