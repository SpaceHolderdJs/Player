import React, { Component } from "react";

export default class AudioEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { file } = this.props;

    this.audio.onloadedmetadata = () => {
      this.setState({ duration: Math.floor(this.audio.duration) });
    };

    const animate = () => {
      this.animation = requestAnimationFrame(animate);
    };
  }

  render() {
    const { file } = this.props;
    const { duration } = this.state;
    console.log(duration);

    return (
      <div
        className="AudioEdit c"
        style={{
          width: `${duration ? duration * 10 + "px" : "100%"}`,
          backgroundColor: `rgba(${Math.floor(
            Math.random() * 250
          )},${Math.floor(Math.random() * 250)},${Math.floor(
            Math.random() * 250
          )}, 0.7)`,
        }}>
        <audio ref={(e) => (this.audio = e)} src={file.path}></audio>
      </div>
    );
  }
}
