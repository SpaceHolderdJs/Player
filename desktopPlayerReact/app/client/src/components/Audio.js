import React, { Component } from "react";

export default class Audio extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    const { audio, setPlaying } = this.props;
    audio.load();
    audio.setAttribute("data-name", e.target.getAttribute("data-name"));
    audio.src = e.target.getAttribute("data-path");
    audio.play();
    setPlaying && setPlaying(false);
  }

  render() {
    const { audio, file } = this.props;

    return (
      <div className="Audio r">
        <div
          className="song r"
          onClick={this.handleClick}
          data-path={file.path}
          data-name={file.name}>
          {file.name}
          {audio &&
            audio.getAttribute("data-name") &&
            audio.getAttribute("data-name") === file.name && (
              <div className="r playing-wrapper">
                <div className="playing playing0"></div>
                <div className="playing playing1"></div>
                <div className="playing playing2"></div>
              </div>
            )}
        </div>
      </div>
    );
  }
}
