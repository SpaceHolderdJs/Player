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
    };

    this.cut = this.cut.bind(this);

    this.saveFile = this.saveFile.bind(this);
  }

  componentDidMount() {
    const { file, initProcessingAudios } = this.props;

    this.audio.onloadedmetadata = () => {
      initProcessingAudios(this.audio);
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

    const freqs = new Uint8Array(this.analyser.frequencyBinCount);

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

  cut() {
    this.setState({ cutting: true });
  }

  saveFile() {
    const { file } = this.props;
    const { start, end } = this.state;

    ipcRenderer.send("saveFile", {
      path: file.path,
      name: file.name,
      start,
      end,
    });

    window.M.toast({ html: "Track was saved " });
  }

  render() {
    const { file, deleteProcessingFile, deleteProcessingAudio } = this.props;
    const { duration, color, end, cutting, start } = this.state;

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
        <div className="r" style={{ fontSize: "15px" }}>
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
            style={{ fontSize: "15px", cursor: "pointer" }}
            onClick={this.saveFile}>
            save
          </i>
        </div>
        <div className="r pinsParent" ref={(e) => (this.pinsParent = e)}>
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
