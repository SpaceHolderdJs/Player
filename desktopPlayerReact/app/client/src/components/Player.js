import React, { Component } from "react";
import { Line } from "react-chartjs-2";

import Playlist from "./Playlist";
import Songs from "./Songs";
import TrackInfo from "./TrackInfo";

export default class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: true,
      dirs: {},
      files: [],
      currentTime: 0,
      duration: 0,
      sections: ["Folders", "Equalizer", "TrackInfo"],
      activeSection: "Folders",
      eqvValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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
    this.handleAudioPlay = this.handleAudioPlay.bind(this);
    this.setActive = this.setActive.bind(this);
    //controlls
    this.handlePlayControll = this.handlePlayControll.bind(this);
    this.handleNextControll = this.handleNextControll.bind(this);
    this.handlePrevControll = this.handlePrevControll.bind(this);
    this.handleDurationChange = this.handleDurationChange.bind(this);
    //basics
    this.initAudio = this.initAudio.bind(this);
    this.convertTime = this.convertTime.bind(this);
    this.setPlaying = this.setPlaying.bind(this);
    //equalizer
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleSelectFilter = this.handleSelectFilter.bind(this);
  }

  componentDidMount() {
    const { frequencies, audio, filters, analyser } = this.props.mainData;
    this.audio = audio;

    this.audio.onplay = this.handleAudioPlay;
    this.audio.onloadedmetadata = () => {
      this.setState({ duration: Math.floor(this.audio.duration) });
    };

    this.interval = setInterval(() => {
      if (this.duration && !this.audio.paused) {
        this.timer.textContent = this.convertTime(this.audio.currentTime);
      }
      this.duration &&
        (this.duration.value = this.audio.currentTime.toFixed(0));
    }, 50);

    const freqs = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
      this.animation = requestAnimationFrame(animate);
      analyser.getByteFrequencyData(freqs);

      this.markers &&
        [...this.markers.children].forEach(
          (e, i) => (e.style.height = `${freqs[i] / 3}px`)
        );

      if (this.charts) {
        const newData = freqs.filter((e, i) => i % 6 === 0).slice(0, 9);
        newData.forEach((e, i) => (this.charts.data.datasets[0].data[i] = e));

        this.charts.update("active");
      }
    };

    animate();

    window.M.AutoInit();
  }

  componentWillUnmount() {
    const { filters } = this.props.mainData;

    filters.forEach((e) => {
      e.gain.value = 0;
      e.type = "peaking";
    });

    window.cancelAnimationFrame(this.animation);
    clearInterval(this.interval);
  }

  setPlaying(val) {
    this.setState({ playing: val });
  }

  handleFilterChange(e) {
    const { eqvValues } = this.state;
    const { filters } = this.props.mainData;
    const indx = +e.target.getAttribute("data-i");
    filters[indx].gain.value = e.target.value;
    eqvValues[indx] = e.target.value;
    this.setState({ eqvValues });
  }

  handleSelectFilter(e) {
    const { filters } = this.props.mainData;
    filters.forEach((el) => (el.type = e.target.value));
  }

  handleDurationChange(e) {
    this.audio.currentTime = +e.target.value;
  }

  setActive(e) {
    this.setState({ activeSection: e.target.textContent });
    console.log(this.state.activeSection);
  }

  convertTime(val) {
    const time = val.toFixed(0);
    const res = {
      h: Math.floor(time / 3600) === 0 ? "00" : Math.floor(time / 3600),
      m:
        Math.floor((time % 3600) / 60) === 0
          ? "00"
          : Math.floor((time % 3600) / 60),
      s: Math.floor(val % 60) === 0 ? "00" : Math.floor(val % 60),
    };

    return [...Object.values(res)].filter((e) => e !== 0).join(":");
  }

  initAudio() {
    if (this.duration) {
      this.duration.value = 0;
      this.duration.max = Math.floor(this.audio.duration);
      this.duration.min = 0;
      this.duration.step = 1;
    }
  }

  handleAudioPlay() {
    const { files } = this.state;
    const name = this.audio.getAttribute("data-name");
    !this.audio.src && (this.audio.src = files[0].path);
    console.log("__", this.audio, files);
    name &&
      this.setState({
        current: files.find((e) => e.name === name),
      });
  }

  handleInitFiles(e) {
    const { initMainFiles } = this.props;

    console.log(e.target.files);
    const files = Object.values(e.target.files).filter((e) =>
      e.type.includes("audio")
    );

    const dirsWas = this.state.dirs;
    dirsWas[files[0].webkitRelativePath.split("/")[0]] = files;

    this.setState({
      dirs: dirsWas,
      files: Array.from(new Set([...this.state.files, ...files])),
      current: files[0],
    });

    initMainFiles(Array.from(new Set([...this.state.files, ...files])));

    console.log(this.state.dirs);

    this.initAudio();
  }

  handlePlayControll() {
    const { playing } = this.state;
    playing ? this.audio.play() : this.audio.pause();
    this.setState({ playing: this.audio.paused });
  }

  handleNextControll() {
    const { files, current } = this.state;
    const next = files[files.indexOf(current) + 1] || files[0];
    this.setState({ current: next });
    this.audio.src = next.path;
    this.audio.setAttribute("data-name", next.name);
    this.setState({ currentTime: 0 });
    this.initAudio();
    this.audio.play();
    this.setState({ playing: this.audio.paused });
  }

  handlePrevControll() {
    const { files, current } = this.state;
    const prev = files[files.indexOf(current) - 1] || files[files.length - 1];
    this.setState({ current: prev });
    this.audio.src = prev.path;
    this.audio.setAttribute("data-name", prev.name);
    this.setState({ currentTime: 0 });
    this.initAudio();
    this.audio.play();
    this.setState({ playing: this.audio.paused });
  }

  render() {
    const { files, current, playing, dirs } = this.state;
    const { duration, sections, activeSection, eqvValues, filterTypes } =
      this.state;

    const { frequencies, filters } = this.props.mainData;

    const markers = [];
    for (let i = 0; i < 100; i++) {
      markers.push(<div className="marker"></div>);
    }

    return (
      <div className="Player">
        {files.length === 0 && (
          <div className="c centr" style={{ margin: "25vh" }}>
            <p>Upload audios to start</p>
            <i
              style={{ color: "rgba(256, 256, 256, 0.8)" }}
              className="material-icons large">
              folder
            </i>
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
        )}

        {files.length !== 0 && (
          <div>
            <div className="r">
              <div className="c section songs-section">
                <span>Your audios</span>
                <Songs
                  songs={files}
                  sects={dirs}
                  audio={this.audio}
                  setPlaying={this.setPlaying}
                />
              </div>
              <div className="c section folders-section">
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
                {activeSection === "Folders" && (
                  <div>
                    <div className="r centr">
                      {Object.keys(dirs).map((e, i) => (
                        <Playlist
                          name={e}
                          audio={this.audio}
                          files={Object.values(dirs)[i]}
                          setPlaying={this.setPlaying}
                        />
                      ))}
                    </div>
                    <label
                      htmlFor="file"
                      className="btn waves-effect btn-small label">
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
                )}

                {activeSection === "Equalizer" && (
                  <div className="r big-wrapper">
                    <div className="eqz-wrapper">
                      {filters &&
                        filters.map((e, i) => (
                          <div key={i} className="range-field r inp-wrapper">
                            <span className="inp-value">
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
                            <input
                              type="range"
                              min="-10"
                              max="10"
                              value={eqvValues[i]}
                              step="0.5"
                              data-i={i}
                              onChange={this.handleFilterChange}
                            />
                            <span className="inp-subval">{eqvValues[i]}</span>
                          </div>
                        ))}
                    </div>
                    <div className="c">
                      <select
                        className="browser-default"
                        onChange={this.handleSelectFilter}>
                        {filterTypes.map((e, i) => (
                          <option key={i} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                      <Line
                        ref={(e) => (this.charts = e)}
                        data={{
                          labels: frequencies,
                          datasets: [
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
                  </div>
                )}

                {activeSection === "TrackInfo" && current && (
                  <TrackInfo songName={current.name} />
                )}
              </div>
            </div>
            <div className="c centr controlls">
              <div
                className="r markers-wrapper"
                ref={(e) => {
                  this.markers = e;
                }}>
                {markers}
              </div>
              <h4>{current.name || "Unknown"}</h4>
              <div className="centr r">
                <p className="range-field waves-effect">
                  <span
                    ref={(e) => {
                      this.timer = e;
                    }}>
                    {this.audio.currentTime
                      ? this.convertTime(this.audio.currentTime)
                      : "00:00"}
                  </span>
                  <input
                    onChange={this.handleDurationChange}
                    className="duration"
                    type="range"
                    value={0}
                    step={1}
                    max={duration}
                    ref={(e) => (this.duration = e)}
                  />
                  <span>
                    {this.audio.duration
                      ? this.convertTime(this.audio.duration)
                      : "00:00"}
                  </span>
                </p>
              </div>
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
        )}
      </div>
    );
  }
}
