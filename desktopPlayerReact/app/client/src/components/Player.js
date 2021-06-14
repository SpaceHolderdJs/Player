import React, { Component } from "react";

import ReactAudioPlayer from "react-audio-player";

export default class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: true,
    };

    this.handleInitFiles = this.handleInitFiles.bind(this);
    this.handlePlaySong = this.handlePlaySong.bind(this);
    //controlls
    this.handlePlayControll = this.handlePlayControll.bind(this);
    this.handleNextControll = this.handleNextControll.bind(this);
    this.handlePrevControll = this.handlePrevControll.bind(this);
  }

  handleInitFiles(e) {
    console.log(e.target.files);
    const files = Object.values(e.target.files).filter((e) =>
      e.type.includes("audio")
    );
    this.setState({
      files: files,
      current: files[0],
    });
  }

  handlePlaySong(e) {
    this.setState({ current: e.target.getAttribute("data-path") });
  }

  handlePlayControll() {
    const { playing } = this.state;
    playing ? this.audio.play() : this.audio.pause();
    this.setState({ playing: !this.state.playing });
  }

  handleNextControll() {
    const { files, current } = this.state;
    const next = files[files.indexOf(current)] + 1 || files[0];
    this.audio.src = next.path;
    this.setState({ current: next });
    this.audio.play();
    console.log(this.audio);
  }

  handlePrevControll() {
    const { files, current } = this.state;
    const prev = files[files.indexOf(current)] - 1 || files[files.length - 1];
    this.audio.src = prev.path;
    this.setState({ current: prev });
    this.audio.play();
    console.log(this.audio);
  }

  render() {
    const { files, current, playing } = this.state;

    if (!files) {
      return (
        <div className="Player">
          <p>Upload audios to start</p>
          <label htmlFor="file" className="btn waves-effect">
            Upload
          </label>
          <input
            id="file"
            type="file"
            webkitdirectory="true"
            multiple
            onChange={this.handleInitFiles}
            placeholder="Select files"
            hidden
          />
        </div>
      );
    } else {
      return (
        <div className="Player">
          <audio
            src={files[0].path || ""}
            controls
            ref={(e) => (this.audio = e)}
          />
          <h2>Your audios</h2>
          {files.map((e, i) => (
            <div key={i} onClick={this.handlePlaySong} data-path={e.path}>
              {e.name}
            </div>
          ))}
          <div className="c centr">
            <h4>{current.name}</h4>
            <div className="r centr">
              <button className="btn waves-effect cntrl">
                <i className="material-icons">fast_rewind</i>
              </button>
              <button
                className="btn waves-effect cntrl"
                onClick={this.handlePlayControll}>
                <i className="material-icons">pause</i>
              </button>
              <button
                className="btn waves-effect cntrl"
                onClick={this.handleNextControll}>
                <i class="material-icons">fast_forward</i>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
}
