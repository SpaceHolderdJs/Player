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
      processingAudios: [],
      currentTime: 0,
    };

    this.handleInitFiles = this.handleInitFiles.bind(this);
    this.setActive = this.setActive.bind(this);

    this.initProcessingFiles = this.initProcessingFiles.bind(this);
    this.deleteProcessingFile = this.deleteProcessingFile.bind(this);

    this.initProcessingAudios = this.initProcessingAudios.bind(this);
    this.deleteProcessingAudio = this.deleteProcessingAudio.bind(this);

    this.playAllSongs = this.playAllSongs.bind(this);

    this.handleTimeInputChange = this.handleTimeInputChange.bind(this);
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

    this.interval = setInterval(() => {
      const { processingAudios } = this.state;

      if (
        processingAudios.length > 0 &&
        processingAudios.filter((e) => !e.paused).length > 0
      )
        this.timeLineInput.value = processingAudios.sort(
          (e1, e2) => e1.duration - e2.duraton
        )[0].currentTime;
    }, 50);

    this.setState({ timeLine });
  }

  componentDidUpdate() {
    const inps = document.querySelectorAll("input[type=range]");
    window.M.Range.init(inps);
  }

  handleTimeInputChange(e) {
    const { processingAudios } = this.state;
    processingAudios.forEach((el) => (el.currentTime = e.target.value));
    this.setState({ currentTime: e.target.value });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  playAllSongs() {
    const { processingAudios } = this.state;
    processingAudios.length > 0
      ? processingAudios.forEach((e) => (e.paused ? e.play() : e.pause()))
      : window.M.toast({ html: "Nothing to play" });
  }

  initProcessingFiles(file) {
    const { processingFiles } = this.state;
    processingFiles.push(file);
    this.setState({ processingFiles: processingFiles });
  }

  deleteProcessingFile(file) {
    const { processingFiles } = this.state;
    const finalFiles = processingFiles.find((e) => e.name === file.name)
      ? processingFiles.filter((e) => e.name !== file.name)
      : processingFiles;
    this.setState({ processingFiles: finalFiles });
  }

  initProcessingAudios(audio) {
    const { processingAudios } = this.state;
    processingAudios.push(audio);
    this.setState({ processingAudios: processingAudios });
  }

  deleteProcessingAudio(audio) {
    const { processingAudios } = this.state;
    processingAudios.find((e) => e.src === audio.src)?.pause();
    const finalAudios = processingAudios.find((e) => e.src === audio.src)
      ? processingAudios.filter((e) => e.src !== audio.src)
      : processingAudios;
    this.setState({ processingAudios: finalAudios });
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
    const {
      files,
      sections,
      activeSection,
      processingFiles,
      timeLine,
      processingAudios,
      currentTime,
    } = this.state;
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
          <div className="c" style={{ position: "sticky", top: "0%" }}>
            <div className="r">
              <i
                className="material-icons"
                onClick={this.playAllSongs}
                style={{ cursor: "pointer" }}>
                {processingAudios[0]?.paused ? "pause" : "play_arrow"}
              </i>
            </div>
            <div className="r" style={{ width: "6000px" }}>
              {timeLine?.map((e, i) => (
                <div key={i} className="r centr" style={{ width: "10px" }}>
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
                value={currentTime}
                step={1}
                style={{ width: "6000px" }}
                onChange={this.handleTimeInputChange}
                ref={(e) => (this.timeLineInput = e)}
              />
            </div>
          </div>
          {processingFiles &&
            processingFiles.map((e) => (
              <AudioEdit
                file={e}
                deleteProcessingFile={this.deleteProcessingFile}
                deleteProcessingAudio={this.deleteProcessingAudio}
                initProcessingAudios={this.initProcessingAudios}
              />
            ))}
        </div>
      </div>
    );
  }
}
