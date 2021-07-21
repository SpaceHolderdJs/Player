import React, { useState, useEffect } from "react";

export default function AudioStudio(props) {
  const { file, initProcessingFiles } = props;

  return (
    <div className="Audio r" style={{ justifyContent: "space-between" }}>
      <span>{file.name}</span>
      <i
        style={{ cursor: "pointer" }}
        className="material-icons"
        onClick={() => {
          initProcessingFiles(file);
        }}>
        edit
      </i>
    </div>
  );
}
