import React, { Component } from "react";

import Section from "./Section";
import AudioEdit from "./AudioEdit";

export default class Studio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sections: ["audios", "sounds"],
      activeSection: "audios",
      files: [],
      processingFiles: [],
    };

    this.handleInitFiles = this.handleInitFiles.bind(this);
    this.setActive = this.setActive.bind(this);

    this.initProcessingFiles = this.initProcessingFiles.bind(this);
  }

  componentDidMount() {
    const { files } = this.props;
    const { audio } = this.props.mainData;
    this.audio = audio;

    files.length > 0 && this.setState({ files });

    const timeLine = [];

    for (let i = 0; i < 601; i++) {
      timeLine.push(i);
    }

    this.setState({ timeLine });
  }

  componentDidUpdate() {
    const inps = document.querySelectorAll("input[type=range]");
    window.M.Range.init(inps);
  }

  initProcessingFiles(file) {
    const { processingFiles } = this.state;
    processingFiles.push(file);
    this.setState({ processingFiles: processingFiles });
  }

  handleInitFiles(e) {
    const { files } = this.state;
    const { initMainFiles } = this.props;

    const f = Object.values(e.target.files).filter((el) =>
      el.type.includes("audio")
    );

    f.forEach((e) => !files.find((el) => el.name === e.name) && files.push(e));
    console.log(files);

    this.setState({ files: files });
    // initMainFiles(files);
  }

  setActive() {}

  render() {
    const { files, sections, activeSection, processingFiles, timeLine } =
      this.state;
    console.log(files);

    return (
      <div className="Studio c centr">
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
                id="file"
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
                initProcessingFiles={this.initProcessingFiles}
              />
            )}
            {activeSection === "sounds" && (
              <Section
                audio={this.audio}
                tracks={files.filter((e) => e.size < 10000)}
                initProcessingFiles={this.initProcessingFiles}
              />
            )}
          </div>
        </div>
        <div className="c duration-bar block">
          <div className="c" style={{ position: "sticky" }}>
            <div className="r" style={{ width: "3000px" }}>
              {timeLine?.map((e) => (
                <div className="r centr" style={{ width: "5px" }}>
                  {+e % 15 === 0 ? "|" : "'"}
                </div>
              ))}
            </div>
            <div className="range-field timeInp-wrapper">
              <input
                className="timeInp"
                type="range"
                min="0"
                max="600"
                value={0}
                step={1}
                style={{ width: "3000px" }}
              />
            </div>
          </div>
          {processingFiles &&
            processingFiles.map((e) => <AudioEdit file={e} />)}
        </div>
      </div>
    );
  }
}
