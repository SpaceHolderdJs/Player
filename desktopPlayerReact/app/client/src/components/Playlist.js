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
      return (
        <div className="Playlist c centr">
          <i className="material-icons large">audiotrack</i>
          <h6>{name}</h6>
          <span>Songs: {files.length}</span>
          <button className="btn" onClick={this.handleClick}>
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
          <button className="btn" onClick={this.handleClick}>
            Close
          </button>
        </div>
      );
    }
  }
}
