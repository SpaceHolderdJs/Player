import React, { Component } from "react";

import Section from "./Section";
import AudioEdit from "./AudioEdit";
import Drum from "./Drum";

import { Line } from "react-chartjs-2";

const { ipcRenderer } = window.require("electron");

export default class Studio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sections: ["audios", "sounds", "folder"],
      activeSection: "audios",
      activeModule: "frq",
      files: [],
      tracklist: [],
      processingFiles: [],
      processingAudios: [],
      currentTime: 0,
      selectedAudio: null,
      filterTypes: [
        "peaking",
        "notch",
        "allpass",
        "bandpass",
        "highpass",
        "lowpass",
        "highshelf",
        "lowshelf",
      ],
    };

    this.handleInitFiles = this.handleInitFiles.bind(this);
    this.setActive = this.setActive.bind(this);
    this.setActiveModule = this.setActiveModule.bind(this);

    this.initProcessingFiles = this.initProcessingFiles.bind(this);
    this.deleteProcessingFile = this.deleteProcessingFile.bind(this);

    this.initProcessingAudios = this.initProcessingAudios.bind(this);
    this.deleteProcessingAudio = this.deleteProcessingAudio.bind(this);

    this.playAllSongs = this.playAllSongs.bind(this);

    this.handleTimeInputChange = this.handleTimeInputChange.bind(this);

    this.setSelectedAudio = this.setSelectedAudio.bind(this);

    this.initAppFolderFiles = this.initAppFolderFiles.bind(this);
    this.initProcess = this.initProcess.bind(this);

    this.saveAllTracks = this.saveAllTracks.bind(this);
    this.addToTracklist = this.addToTracklist.bind(this);
    this.removeFromTrackList = this.removeFromTrackList.bind(this);
  }

  componentDidMount() {
    const { files, frequencies } = this.props;
    const { audio } = this.props.mainData;
    this.audio = audio;

    files.length > 0 && this.setState({ files });

    const timeLine = [];

    for (let i = 0; i < 601; i++) {
      timeLine.push(i);
    }

    const timeLinear = [];

    timeLine.forEach((e, i) => i % 15 === 0 && timeLinear.push(e));
    this.setState({ timeLinear });

    this.interval = setInterval(() => {
      const { processingAudios } = this.state;

      if (
        processingAudios.length > 0 &&
        processingAudios.filter((e) => !e.audio.paused).length > 0
      )
        this.timeLineInput.value = processingAudios.sort(
          (e1, e2) => e1.audio.duration - e2.audio.duraton
        )[0].audio.currentTime;
    }, 50);

    this.setState({ timeLine });

    const animate = () => {
      this.animation = requestAnimationFrame(animate);

      const { processingAudios } = this.state;

      if (processingAudios && processingAudios.length > 0) {
        if (this.charts) {
          processingAudios
            .filter((e) => !e.audio.paused)
            .forEach((e, indx) => {
              const freqs = new Uint8Array(e.analyser.frequencyBinCount);
              e.analyser.getByteFrequencyData(freqs);

              const newData = freqs.filter((e, i) => i % 6 === 0).slice(0, 9);
              newData.forEach(
                (e, i) => (this.charts.data.datasets[indx].data[i] = e)
              );

              this.charts.update("active");
            });
        }
      }
    };

    ipcRenderer.send("scanFolder", "");

    ipcRenderer.on("scanedFolder", (event, files) => {
      console.log("files getted", files);
      this.setState({ appFolderFiles: files });
    });

    animate();
  }

  componentDidUpdate() {
    const inps = document.querySelectorAll("input[type=range]");
    window.M.Range.init(inps);
  }

  setActiveModule(e) {
    this.setState({ activeModule: e.target.getAttribute("data-module") });
  }

  initAppFolderFiles(files) {
    this.setState({ appFolderFiles: files });
  }

  initProcess(process) {
    this.setState({ process });
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
      ? processingAudios.forEach((e) =>
          e.audio.paused ? e.audio.play() : e.audio.pause()
        )
      : window.M.toast({ html: "Nothing to play" });
  }

  initProcessingFiles(file) {
    const { processingFiles } = this.state;
    processingFiles.push(file);
    this.setState({ processingFiles: processingFiles });
  }

  deleteProcessingFile(file) {
    const { processingFiles, selectedAudio } = this.state;
    const finalFiles = processingFiles.find((e) => e.name === file.name)
      ? processingFiles.filter((e) => e.name !== file.name)
      : processingFiles;

    if (selectedAudio && selectedAudio.name === file.name) {
      this.setState({ selectedAudio: null });
    }

    this.setState({ processingFiles: finalFiles });
  }

  initProcessingAudios(audio) {
    const { processingAudios } = this.state;
    processingAudios.push(audio);
    this.setState({ processingAudios: processingAudios });
  }

  deleteProcessingAudio(data) {
    const { processingAudios } = this.state;
    //data == audioElement
    processingAudios.find((e) => e.audio.src === data.src)?.audio.pause();
    const finalAudios = processingAudios.find((e) => e.audio.src === data.src)
      ? processingAudios.filter((e) => e.audio.src !== data.src)
      : processingAudios;
    this.setState({ processingAudios: finalAudios });
  }

  setSelectedAudio(data) {
    this.setState({ selectedAudio: data });
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

  setActive(e) {
    this.setState({ activeSection: e.target.getAttribute("data-name") });
  }

  saveAllTracks() {
    const { tracklist, globalName } = this.state;

    console.log(tracklist);

    globalName
      ? ipcRenderer.send("saveAllTracks", { tracklist, globalName })
      : window.M.toast({ html: "Select name for future track" });

    ipcRenderer.on("allTracksSaved", (resp, files) => {
      this.setState({ appFolderFiles: files, globalName: null });
    });

    window.M.toast({ html: "Track was saved " });
  }

  addToTracklist(track) {
    const { tracklist } = this.state;
    tracklist.push(track);
    this.setState({ tracklist });
  }

  removeFromTrackList(track) {
    const { tracklist } = this.state;

    const newTracklist = tracklist.filter(
      (e) =>
        !Object.values(e)
          .filter((e) => typeof e !== "object")
          .every(
            (el, i) =>
              el ===
              Object.values(track).filter((e) => typeof e !== "object")[i]
          )
    );

    this.setState({ tracklist: newTracklist });
  }

  render() {
    const {
      files,
      sections,
      activeSection,
      processingFiles,
      timeLine,
      processingAudios,
      currentTime,
      selectedAudio,
      filterTypes,
      timeLinear,
      appFolderFiles,
      process,
      activeModule,
    } = this.state;
    console.log(files);

    const { frequencies } = this.props.mainData;
    const { user } = this.props;

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
                  data-name={e}
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
            {activeSection === "folder" &&
              (appFolderFiles ? (
                <Section
                  audio={this.audio}
                  tracks={appFolderFiles}
                  initProcessingFiles={this.initProcessingFiles}
                />
              ) : (
                <div className="c centr">
                  <h3>Initing...</h3>
                  <div className="progress">
                    <div className="indeterminate"></div>
                  </div>
                </div>
              ))}
          </div>
          <div
            className="block c"
            style={{
              width: "550px",
              background: `${
                selectedAudio
                  ? `rgba(${selectedAudio.color.r},${selectedAudio.color.g},${selectedAudio.color.b}, 0.7 )`
                  : "none"
              }`,
            }}>
            <span>For: {selectedAudio?.name || "All"} </span>
            <div className="r">
              <div className="c eqz-erapper">
                {frequencies?.map((e, i) => (
                  <div className="r big-wrapper" key={i}>
                    <div className="inp-wrapper" style={{ width: "350px" }}>
                      <span className="inp-subval">
                        {selectedAudio ? selectedAudio.eqvVals[i] : 0}
                      </span>
                      <input
                        type="range"
                        value={selectedAudio ? selectedAudio.eqvVals[i] : 0}
                        max="10"
                        min="-10"
                        step="1"
                        style={{ width: "250px", margin: "10px" }}
                        onChange={(evt) => {
                          if (selectedAudio) {
                            selectedAudio.filters[i].gain.value =
                              evt.target.value;

                            selectedAudio.eqvVals[i] = evt.target.value;
                            this.setState({ selectedAudio });
                          }
                        }}
                      />
                      <span style={{ marginLeft: "5px" }}>
                        {frequencies[i].toString().length > 3
                          ? frequencies[i]
                              .toString()
                              .slice(
                                0,
                                Math.trunc(
                                  frequencies[i].toString().length / 2.5
                                )
                              ) + "k"
                          : frequencies[i]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <select
                defaultValue={{ label: "peaking", value: "peaking" }}
                className="browser-default"
                onChange={(evt) => {
                  if (selectedAudio) {
                    selectedAudio.filters.forEach(
                      (e) => (e.type = evt.target.value)
                    );
                    selectedAudio.typeF = evt.target.value;
                    this.setState({ selectedAudio });
                  }
                }}>
                {filterTypes.map((e, i) =>
                  selectedAudio?.typeF === e ? (
                    <option value={e} key={i}>
                      {e}
                    </option>
                  ) : (
                    <option value={e} key={i}>
                      {e}
                    </option>
                  )
                )}
              </select>
              <button
                style={{ margin: "10px", color: "aqua" }}
                className="btn waves-effect black"
                onClick={() => {
                  if (selectedAudio) {
                    selectedAudio.filters.forEach((e, i) => {
                      e.gain.value = 0;
                      selectedAudio.eqvVals[i] = 0;
                    });
                    window.M.toast({ html: "Equalizer settings was reloaded" });
                    this.setState({ selectedAudio });
                  }
                }}>
                <i className="material-icons">settings_backup_restore</i>
              </button>
            </div>
          </div>
          <div
            className="block c centr"
            style={{ width: "500px", padding: "10px" }}>
            <div className="r">
              <div
                className="crumb c centr waves-effect"
                onClick={this.setActiveModule}
                data-module="frq">
                Frequencies
              </div>
              <div
                className="crumb c centr waves-effect"
                onClick={this.setActiveModule}
                data-module="drm">
                Electro-drum
              </div>
            </div>
            {activeModule === "frq" ? (
              <div>
                <h6 className="r centr">
                  <i className="material-icons">equalizer</i>Frequencies (hz)
                </h6>
                <Line
                  ref={(e) => (this.charts = e)}
                  data={{
                    labels: frequencies,
                    datasets:
                      processingAudios && processingAudios.length > 0
                        ? processingAudios.map((e, i) => {
                            return {
                              label: processingFiles[i]?.name,
                              fill: true,
                              borderColor: `rgba(${processingAudios[i].color.r},${processingAudios[i].color.g},${processingAudios[i].color.b} ,0.7)`,
                              backgroundColor: `rgba(${
                                processingAudios[i].color.r + 10
                              },${processingAudios[i].color.g + 10},${
                                processingAudios[i].color.b + 10
                              } ,0.7)`,
                              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                              borderWidth: 1,
                            };
                          })
                        : [
                            {
                              label: "Dynamic frequinses",
                              fill: true,
                              borderColor: "teal",
                              backgroundColor: "aqua",
                              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                              borderWidth: 1,
                            },
                          ],
                  }}
                  height={70}
                  width={150}
                  options={{
                    responsive: true,
                    layout: {
                      padding: 10,
                    },
                    scales: {
                      yAxes: [
                        {
                          ticks: {
                            beginAtZero: false,
                          },
                        },
                      ],
                    },
                    maintainAspectRatio: true,
                  }}
                />
              </div>
            ) : (
              <Drum />
            )}
          </div>
        </div>
        <div
          className="c duration-bar block"
          style={{
            animation: `${process ? "processing 5s linear infinite" : "none"}`,
          }}>
          <div
            className="c"
            style={{
              position: "sticky",
              top: "0%",
              background: "rgba(0,0,0,0.5)",
            }}>
            <div className="r">
              <i
                className="material-icons"
                onClick={this.playAllSongs}
                style={{ cursor: "pointer" }}>
                {processingAudios[0]?.paused ? "pause" : "play_arrow"}
              </i>
              <i
                className="material-icons"
                style={{ cursor: "pointer" }}
                onClick={this.saveAllTracks}>
                save
              </i>
              <input
                style={{
                  width: "200px",
                  height: "20px",
                  marginLeft: "10px",
                  background: "linear-gradient(90deg, teal, rgba(0, 0, 0, 0))",
                  padding: "10px",
                }}
                type="text"
                placeholder="Save as..."
                onChange={(e) => {
                  this.setState({ globalName: e.target.value });
                }}
              />
            </div>
            <div
              className="r"
              style={{
                width: "6000px",
                justifyContent: "space-between",
              }}>
              {timeLinear?.map((e, i) => (
                <span
                  key={i}
                  className="r centr"
                  style={{
                    width: "15px",
                    fontSize: "10px",
                  }}>
                  {Math.trunc(e / 60).toString().length > 1
                    ? Math.trunc(e / 60)
                    : `0${Math.trunc(e / 60)}`}
                  :{(e % 60).toString().length > 1 ? e % 60 : `0${e % 60}`}
                </span>
              ))}
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
                user={user}
                deleteProcessingFile={this.deleteProcessingFile}
                deleteProcessingAudio={this.deleteProcessingAudio}
                initProcessingAudios={this.initProcessingAudios}
                setSelectedAudio={this.setSelectedAudio}
                initAppFolderFiles={this.initAppFolderFiles}
                initProcess={this.initProcess}
                addToTracklist={this.addToTracklist}
                removeFromTrackList={this.removeFromTrackList}
              />
            ))}
        </div>
      </div>
    );
  }
}
