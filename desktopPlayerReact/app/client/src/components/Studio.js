import React, { Component } from "react";

import Audio from "./Audio";
import Section from "./Section";

export default class Studio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sections: ["audios", "sounds"],
      activeSection: "audios",
      files: [],
    };

    this.handleInitFiles = this.handleInitFiles.bind(this);
    this.setActive = this.setActive.bind(this);
  }

  componentDidMount() {
    const { files, pause } = this.props;
    files.length > 0 && this.setState({ files });
    console.log(files);
    pause && this.audio && this.audio.pause();
  }

  handleInitFiles(e) {
    const { files } = this.state;
    const { initMainFiles } = this.props;

    const f = Object.values(e.target.files).filter((el) =>
      el.type.includes("audio")
    );

    f.forEach((e) => !files.find((el) => el.name === e.name) && files.push(e));
    console.log(files);
    alert("!!");

    this.setState({ files: files });
    // initMainFiles(files);
  }

  setActive() {}

  render() {
    const { files, sections, activeSection } = this.state;
    console.log(files);

    return (
      <div className="Studio c centr">
        <audio ref={(e) => (this.audio = e)}></audio>
        <div className="r">
          <div className="c block files-block">
            <h5 className="r centr">
              <i className="material-icons">queue_music</i> Files(audios)
              <label
                htmlFor="file"
                className="btn waves-effect btn-small label">
                <i className="material-icons">library_music</i>
              </label>
              <input
                type="file"
                webkitdirectory="true"
                multiple
                onChange={this.handleInitFiles}
                placeholder="Select files"
                hidden
              />
            </h5>
            <div className="r">
              {sections.map((e, i) => (
                <div
                  key={i}
                  className={`crumb c centr waves-effect ${
                    activeSection === e && "active"
                  }`}
                  name={e}
                  onClick={this.setActive}>
                  {e[0].toUpperCase() + e.slice(1, e.length)}
                </div>
              ))}
            </div>
            {activeSection === "audios" && (
              <Section
                audio={this.audio}
                tracks={files.filter((e) => e.size > 100)}
              />
            )}
            {activeSection === "sounds" && (
              <Section
                audio={this.audio}
                tracks={files.filter((e) => e.size < 10000)}
              />
            )}
          </div>
        </div>
        <div className="c duration-bar block">
          <div className="r"></div>
        </div>
      </div>
    );
  }
}
