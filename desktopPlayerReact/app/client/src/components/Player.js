import React, { Component } from "react";

import Playlist from "./Playlist";

export default class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: true,
      dirs: {},
      files: [],
      current: "",
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

    const dirsWas = this.state.dirs;
    dirsWas[files[0].webkitRelativePath.split("/")[0]] = files;

    this.setState({
      dirs: dirsWas,
      files: [this.state.files, ...files],
      current: files[0],
    });
  }

  handlePlaySong(e) {
    this.setState({ current: e.target.getAttribute("data-path") });
    this.audio.src = e.target.getAttribute("data-path");
    this.audio.play();
    console.log(this.audio);
  }

  handlePlayControll() {
    const { playing } = this.state;
    playing ? this.audio.play() : this.audio.pause();
    this.setState({ playing: !this.state.playing });
  }

  handleNextControll() {
    const { files, current } = this.state;
    const next = files[files.indexOf(current) + 1] || files[0];
    this.setState({ current: next });
    this.audio.src = next.path;
    this.audio.play();
    this.setState({ playing: true });
    console.log(this.audio);
  }

  handlePrevControll() {
    const { files, current } = this.state;
    const prev = files[files.indexOf(current) - 1] || files[files.length - 1];
    this.setState({ current: prev });
    this.audio.src = prev.path;
    this.audio.play();
    this.setState({ playing: true });
    console.log(this.audio);
  }

  render() {
    const { files, current, playing, dirs } = this.state;

    if (files.length === 0) {
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
            src={files[0] ? files[0].path : ""}
            controls
            ref={(e) => (this.audio = e)}
          />
          <p>Upload more audios</p>
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
          <h2>Your audios</h2>
          <div className="r centr">
            {Object.keys(dirs).map((e, i) => (
              <Playlist
                name={e}
                audio={this.audio}
                files={Object.values(dirs)[i]}
              />
            ))}
          </div>
          <div className="c centr">
            <h4>{current.name}</h4>
            <div className="r centr">
              <button
                className="btn waves-effect cntrl"
                onClick={this.handlePrevControll}>
                <i className="material-icons">fast_rewind</i>
              </button>
              <button
                className="btn waves-effect cntrl"
                onClick={this.handlePlayControll}>
                <i className="material-icons">
                  {playing ? "play_arrow" : "pause"}
                </i>
              </button>
              <button
                className="btn waves-effect cntrl"
                onClick={this.handleNextControll}>
                <i className="material-icons">fast_forward</i>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }
}
