import React, { Component } from "react";

import Nouislider from "nouislider-react";
import "nouislider/distribute/nouislider.css";

const { ipcRenderer } = window.require("electron");

export default class AudioEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      color: {
        r: Math.floor(Math.random() * 250),
        g: Math.floor(Math.random() * 250),
        b: Math.floor(Math.random() * 250),
      },
      cutting: false,
      loading: false,
      format: null,
      frequencies: [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000],
    };

    this.cut = this.cut.bind(this);

    this.saveFile = this.saveFile.bind(this);
    this.selectFormat = this.selectFormat.bind(this);
  }

  componentDidMount() {
    const { file, initProcessingAudios } = this.props;

    this.audio.onloadedmetadata = () => {
      this.setState({
        duration: Math.floor(this.audio.duration),
        start: this.audio.currentTime,
        end: Math.floor(this.audio.duration),
      });
    };
    this.pins = [];
    this.pins.length = 150;
    this.pins.fill(0);

    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;

    this.source = this.audio
      ? this.audioCtx.createMediaElementSource(this.audio)
      : null;

    this.source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    initProcessingAudios({
      audio: this.audio,
      analyser: this.analyser,
      color: this.state.color,
    });

    const freqs = new Uint8Array(this.analyser.frequencyBinCount);

    const { frequencies } = this.state;

    const createFilter = (frequency) => {
      const filter = this.audioCtx.createBiquadFilter();

      filter.type = "peaking";
      filter.frequency.value = frequency;
      filter.Q.value = 1;
      filter.gain.value = 0;

      return filter;
    };

    const createFilters = () => {
      const filters = frequencies.map(createFilter);

      filters.reduce((prev, curr) => {
        prev.connect(curr);
        return curr;
      });

      return filters;
    };

    this.filters = createFilters();

    this.source.connect(this.filters[0]);
    this.filters[this.filters.length - 1].connect(this.audioCtx.destination);

    this.setState({ filters: this.filters });

    const animate = () => {
      this.animation = requestAnimationFrame(animate);

      if (this.audio && !this.audio.paused) {
        this.analyser.getByteFrequencyData(freqs);
        const { end, start } = this.state;

        if (end && +this.audio.currentTime.toFixed(0) === end) {
          this.audio.pause();
          this.audio.currentTime = start || 0;
        }

        freqs
          .slice(0, 150)
          .forEach(
            (e, i) =>
              (this.pinsParent.children[i].style.height = `${Math.floor(
                e / 5
              )}px`)
          );
      }
    };

    animate();
  }

  selectFormat(e) {
    this.setState({ format: e.target.value });
  }

  cut() {
    this.setState({ cutting: true });
  }

  saveFile() {
    const { file, user } = this.props;
    const { start, end, format } = this.state;

    ipcRenderer.send("saveFile", {
      path: file.path,
      name: file.name,
      start,
      end,
      format,
      filterType: this.filters[0].type,
      filterVals: this.filters.map((e) => e.gain.value),
    });

    this.setState({ loading: true });

    ipcRenderer.on("fileSaved", (event, files) => {
      const { initAppFolderFiles, initProcess } = this.props;
      initProcess(null);
      console.log("!!", files);

      this.setState({ loading: false });

      initAppFolderFiles(files);

      window.M.toast({ html: "Track was saved " });

      fetch(`/api/score`, {
        method: "POST",
        body: JSON.stringify(user.user),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((bdUser) => user.setUser(bdUser.user));
    });

    ipcRenderer.on("error", (event, message) => {
      window.M.toast({ html: message });
      this.setState({ loading: false });
    });

    ipcRenderer.on("process", (event, process) => {
      const { initProcess } = this.props;
      initProcess(process);
    });

    window.M.toast({ html: "Processing... " });
  }

  render() {
    const { file, deleteProcessingFile, deleteProcessingAudio } = this.props;
    const { duration, color, end, cutting, start, loading } = this.state;

    return (
      <div
        className="AudioEdit c"
        style={{
          width: `${
            end && start === 0
              ? end * 10 + "px"
              : end && start > 0
              ? (end - start) * 10 + "px"
              : "100%"
          }`,
          backgroundColor: `rgba(${color.r},${color.g},${color.b}, 0.7)`,
          marginLeft: `${start && start > 0 ? start * 10 + "px" : "0px"}`,
        }}>
        <audio ref={(e) => (this.audio = e)} src={file.path}></audio>
        {cutting && (
          <Nouislider
            range={{ min: 0, max: duration || 0 }}
            onChange={(e) => {
              console.log(e);
              this.setState({
                start: Math.trunc(+e[0]),
                end: Math.trunc(+e[1]),
              });
              this.audio.currentTime = Math.trunc(+e[0]);
            }}
            tooltips={[true, true]}
            start={[0, duration || 0]}
            connect
          />
        )}
        <div className="r" style={{ fontSize: "15px", zIndex: "10" }}>
          <span className="tools">{file.name}</span>
          <span className="tools">
            {(end / 60).toFixed(0).length > 1
              ? (end / 60).toFixed(0)
              : "0" + (end / 60).toFixed(0)}
            :
            {(end % 60).toFixed(0).length > 1
              ? (end % 60).toFixed(0)
              : "0" + (end % 60).toFixed(0)}
          </span>
          <i
            style={{ cursor: "pointer", fontSize: "15px" }}
            className="material-icons tools"
            onClick={() => {
              deleteProcessingFile(file);
              deleteProcessingAudio(this.audio);
            }}>
            delete
          </i>
          <i
            className="material-icons tools"
            style={{ cursor: "pointer", fontSize: "15px" }}
            onClick={() => {
              this.setState({ cutting: !this.state.cutting });
            }}>
            content_cut
          </i>
          <i
            style={{ cursor: "pointer", fontSize: "15px" }}
            className="material-icons tools"
            onClick={(e) => {
              if (+this.audio.volume !== 0) {
                this.audio.volume = 0;
                e.target.textContent = "volume_off";
              } else {
                this.audio.volume = 1;
                e.target.textContent = "volume_up";
              }
            }}>
            volume_up
          </i>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            className="tools "
            onChange={(e) => {
              this.audio.volume = +e.target.value;
            }}
          />
          <i
            style={{ cursor: "pointer", fontSize: "15px" }}
            className="material-icons tools"
            onClick={(e) => {
              if (this.audio.paused) {
                this.audio.play();
                e.target.textContent = "pause";
              } else {
                this.audio.pause();
                e.target.textContent = "play_arrow";
              }
            }}>
            play_arrow
          </i>
          <i
            className="material-icons tools"
            style={{
              fontSize: "15px",
              cursor: "pointer",
            }}
            onClick={() => {
              const { setSelectedAudio, file } = this.props;
              const { filters, color } = this.state;

              const eqvVals = [];
              filters.forEach((e) => eqvVals.push(e.gain.value));

              setSelectedAudio({
                filters,
                name: file.name,
                color,
                eqvVals,
                typeF: filters[0].type,
              });
            }}>
            equalizer
          </i>
          <i
            className="material-icons tools"
            style={{ fontSize: "15px", cursor: "pointer" }}
            onClick={this.saveFile}>
            save
          </i>
          {loading && (
            <div
              className="preloader-wrapper small active tools"
              style={{ width: "15px", height: "15px" }}>
              <div className="spinner-layer spinner-green-only">
                <div className="circle-clipper left">
                  <div className="circle"></div>
                </div>
                <div className="gap-patch">
                  <div className="circle"></div>
                </div>
                <div className="circle-clipper right">
                  <div className="circle"></div>
                </div>
              </div>
            </div>
          )}
          <select
            className="browser-default tools"
            style={{
              background: `rgba(${color.r},${color.g},${color.b}, 0.7)`,
            }}
            onChange={this.selectFormat}>
            <option value="mp3" selected>
              mp3
            </option>
            <option value="flac">flac</option>
            <option value="wav">wav</option>
            <option value="ogg">ogg</option>
          </select>
        </div>
        <div
          className="r pinsParent"
          ref={(e) => (this.pinsParent = e)}
          style={{
            width: `${cutting ? end + "px" : "100%"}`,
            display: `${cutting ? "none" : "flex"}`,
          }}>
          {this.pins?.map((e, i) => (
            <div
              key={i}
              className="pin"
              style={{
                backgroundColor: `rgba(${color.r + 5},${color.g + 5},${
                  color.b + 5
                }, 0.7)`,
                border: `1px solid rgba(${color.r + 10},${color.g + 10},${
                  color.b + 10
                }, 0.7)`,
              }}></div>
          ))}
        </div>
      </div>
    );
  }
}
