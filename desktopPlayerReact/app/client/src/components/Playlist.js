import React, { Component } from "react";

import Audio from "./Audio";

export default class Playlist extends Component {
  constructor(props) {
    super(props);
    this.state = { active: false };

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState({ active: !this.state.active });
  }

  render() {
    const { files, audio, name } = this.props;
    const { active } = this.state;

    if (!active) {
      let size = 0;

      files.forEach((e) => (size += e.size));
      return (
        <div className="Playlist c centr">
          <i className="material-icons large">audiotrack</i>
          <h6>{name}</h6>
          <span>Total size: {(size / 1024 / 1024).toFixed(1)} mb</span>
          <span>Songs: {files.length}</span>
          <button
            className="btn btn-small waves-effect"
            onClick={this.handleClick}>
            Open
          </button>
        </div>
      );
    } else {
      return (
        <div className="Playlist-full">
          <h5>{name}</h5>
          {files.map((e) => (
            <Audio audio={audio} file={e} />
          ))}
          <button
            className="btn btn-small waves-effect"
            onClick={this.handleClick}>
            Close
          </button>
        </div>
      );
    }
  }
}
