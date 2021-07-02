import React, { Component } from "react";

import * as THREE from "three";

import texture from "../../src/tiles.png";

import Playlist from "./Playlist";
import Songs from "./Songs";

console.log("__", texture);

export default class Player extends Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: true,
      dirs: {},
      files: [],
      currentTime: 0,
      duration: 0,
    };

    this.audio = document.querySelector("audio");

    this.handleInitFiles = this.handleInitFiles.bind(this);
    this.handleAudioPlay = this.handleAudioPlay.bind(this);
    //controlls
    this.handlePlayControll = this.handlePlayControll.bind(this);
    this.handleNextControll = this.handleNextControll.bind(this);
    this.handlePrevControll = this.handlePrevControll.bind(this);
    this.handleDurationChange = this.handleDurationChange.bind(this);

    this.initAudio = this.initAudio.bind(this);

    this.convertTime = this.convertTime.bind(this);
  }

  componentDidMount() {
    this.audio.onplay = this.handleAudioPlay;
    this.audio.onloadedmetadata = () => {
      this.setState({ duration: Math.floor(this.audio.duration) });
    };

    setInterval(() => {
      if (this.duration) {
        !audio.paused &&
          this.setState({ currentTime: this.state.currentTime + 1 });
        //  && (this.duration.value = +this.duration.value + 1);
        console.log(this.duration, this.duration.value);
      }
    }, 1000);

    // THREE
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    // renderer.setClearColor("rgb(38, 41, 38)");
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    //texturing

    const textureLoader = new THREE.TextureLoader();

    const tiles = textureLoader.load(`${texture}`);
    console.log(tiles, texture);
    tiles.anisotropy = 20;

    const ballGeometry = new THREE.SphereBufferGeometry(4, 30, 30);
    ballGeometry.computeFaceNormals();
    ballGeometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({
      wireframe: true,
      roughness: 0.3,
      metalness: 0.9,
      blending: true,
    });

    // renderer.physicallyCorrectLights = true;

    const ballMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("black"),
      roughness: 0.5,
      metalness: 0.9,
      side: THREE.BackSide,
      colorWrite: true,
      flatShading: true,
      normalMap: tiles,
      blending: true,
      refractionRatio: 10,
    });

    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(ball);
    ball.position.z = 0;

    scene.background = new THREE.Color("black");

    scene.fog = new THREE.FogExp2(new THREE.Color("rgb(38, 41, 38)"), 0.01);

    const planeGeometry = new THREE.PlaneGeometry(550, 550, 199, 199);
    const position = planeGeometry.attributes.position;

    for (let i = 0; i < position.count; i++) {
      const z = Math.random() * 10 * Math.sin(Math.random() / 2);
      position.setZ(i, z);
    }

    camera.position.z = 10;

    const light = new THREE.PointLight(0xffff, 10, 1000);

    light.position.set(3, 3, -5);
    scene.add(light);

    const light2 = new THREE.PointLight("red", 10, 1000);

    light2.position.set(-3, -3, -5);
    scene.add(light2);

    const plane = new THREE.Mesh(planeGeometry, material);
    scene.add(plane);

    plane.rotateX(90);
    plane.position.setY(-30);

    // listeners

    window.addEventListener("mousemove", (e) => {
      camera.position.x += (e.pageX - window.innerWidth / 2) / 50000;
      camera.position.y += (e.pageY - window.innerHeight / 2) / 50000;
    });

    window.addEventListener("resize", function () {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    [...document.querySelectorAll("input")].forEach((e) =>
      e.addEventListener("click", () => {
        plane.material.color.setColorName("teal");
        return setTimeout(() => {
          plane.material.color.setColorName("white");
        }, 3000);
      })
    );

    //visualizer

    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const audio = this.audio || document.querySelector("audio");

    const source = audio ? audioCtx.createMediaElementSource(audio) : null;

    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    console.log("==", analyser.channelCount);
    console.log(audio);

    const freqs = new Uint8Array(analyser.frequencyBinCount);

    const animate = () => {
      requestAnimationFrame(animate);
      ball.rotation.x += 0.005;
      ball.rotation.y += 0.005;

      plane.rotation.z += 0.003;
      // plane.rotation.x += 0.003;

      if (!audio.paused) {
        analyser.getByteFrequencyData(freqs);
        this.markers &&
          [...this.markers.children].forEach(
            (e, i) => (e.style.height = `${freqs[i] / 3}px`)
          );
        plane.material.color.setRGB(freqs[9], freqs[4], freqs[12]);

        light.color.setRGB(freqs[9] / 100, freqs[4] / 100, freqs[12] / 100);
        light2.color.setRGB(freqs[15] / 100, freqs[20] / 100, freqs[1] / 100);
      }

      const position = planeGeometry.attributes.position;
      position.usage = THREE.DynamicDrawUsage;

      renderer.render(scene, camera);
    };
    animate();
  }

  handleDurationChange(e) {
    this.setState({ currentTime: +e.target.value });
    this.audio.currentTime = +e.target.value;
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

    console.log(this.state.dirs);

    this.initAudio();
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
    this.audio.setAttribute("data-name", next.name);
    this.setState({ currentTime: 0 });
    this.initAudio();
    this.audio.play();
    this.setState({ playing: true });
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
    this.setState({ playing: true });
  }

  render() {
    const { files, current, playing, dirs } = this.state;

    const markers = [];
    for (let i = 0; i < 100; i++) {
      markers.push(<div className="marker"></div>);
    }

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
      const { currentTime, duration } = this.state;
      return (
        <div className="Player">
          <div className="r">
            <div className="c section songs-section">
              <span>Your audios</span>
              <Songs songs={files} sects={dirs} audio={this.audio} />
            </div>
            <div className="c section folders-section">
              <div className="r">
                <span>Folders</span>
                <label htmlFor="file" className="btn waves-effect btn-small">
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

              <div className="r centr">
                {Object.keys(dirs).map((e, i) => (
                  <Playlist
                    name={e}
                    audio={this.audio}
                    files={Object.values(dirs)[i]}
                  />
                ))}
              </div>
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
                <span>
                  {this.audio.currentTime
                    ? this.convertTime(this.audio.currentTime)
                    : "00:00"}
                </span>
                <input
                  onChange={this.handleDurationChange}
                  className="duration"
                  type="range"
                  value={currentTime}
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
      );
    }
  }
}
