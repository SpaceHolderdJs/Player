import React, { Component } from "react";

export default class Audio extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    const { audio } = this.props;
    audio.src = e.target.getAttribute("data-path");
    audio.play();
  }

  render() {
    const { audio, file } = this.props;

    return (
      <div className="Audio r">
        <p onClick={this.handleClick} data-path={file.path}>
          {file.name}
        </p>
      </div>
    );
  }
}
