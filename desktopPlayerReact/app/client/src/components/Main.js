import React, { Component } from "react";
import * as THREE from "three";
import { Bar } from "react-chartjs-2";
import { OBJLoader } from "../../node_modules/three/examples/jsm/loaders/OBJLoader";

import texture from "../../src/img/tiles.png";
import statue from "../../src/img/statue.obj";
import userBg from "../../src/img/userBg.jpg";

import User from "./User";
import Player from "./Player";
import Studio from "./Studio";

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      module: "login",
      form: {},
      frequencies: [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000],
      tab: "player",
      files: [],
    };

    this.handleAuth = this.handleAuth.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.hadleLogout = this.hadleLogout.bind(this);
    this.setUser = this.setUser.bind(this);
    this.handleModuleSwitch = this.handleModuleSwitch.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.handleFilesInit = this.handleFilesInit.bind(this);
    this.handleSceneChange = this.handleSceneChange.bind(this);
  }

  componentDidMount() {
    // auth

    localStorage.getItem("user") &&
      this.setState({ user: JSON.parse(localStorage.getItem("user")) });

    // THREE

    if (!document.querySelector(".three")) {
      const { frequencies } = this.state;

      const scene = new THREE.Scene();
      this.scene = scene;
      this.three = {};

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
      });
      // renderer.setClearColor("rgb(38, 41, 38)");
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.className = "three";
      document.body.appendChild(renderer.domElement);

      //texturing

      const textureLoader = new THREE.TextureLoader();

      const tiles = textureLoader.load(`${texture}`);
      console.log(tiles, texture);
      tiles.anisotropy = 20;

      const loader = new OBJLoader();
      loader.load(statue, (statueObj) => {
        console.log(statueObj);

        statueObj.position.z = -20;
        statueObj.position.y = -57;
        statueObj.scale.set(0.03, 0.03, 0.03);

        statueObj.rotation.y += 150;

        console.log(statueObj.children[0].geometry);

        statueObj.children[0].material = new THREE.MeshStandardMaterial({
          color: "rgb(40,40,40)",
          roughness: 0.5,
          metalness: 0.7,
        });

        statueObj.name = "statue";
        scene.add(statueObj);
        statueObj.visible = false;

        this.three.statue = statueObj;
      });

      const ballGeometry = new THREE.SphereBufferGeometry(4, 30, 30);
      ballGeometry.computeFaceNormals();
      ballGeometry.computeVertexNormals();
      const material = new THREE.MeshStandardMaterial({
        wireframe: true,
        roughness: 0.3,
        metalness: 0.9,
        blending: true,
      });

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
      ball.position.z = 0;

      scene.add(ball);

      this.three.discoBall = ball;

      scene.background = new THREE.Color("black");

      scene.fog = new THREE.FogExp2(new THREE.Color("rgb(38, 41, 38)"), 0.01);

      const planeGeometry = new THREE.PlaneGeometry(550, 550, 199, 199);
      const position = planeGeometry.attributes.position;

      for (let i = 0; i < position.count; i++) {
        const z = Math.random() * 10 * Math.sin(Math.random() / 2);
        position.setZ(i, z);
      }

      camera.position.z = 10;

      const light = new THREE.PointLight(0xffff, 10, 20);

      light.position.set(3, 3, -5);
      scene.add(light);

      const light2 = new THREE.PointLight("red", 10, 20);

      light2.position.set(-3, -3, -5);
      scene.add(light2);

      const plane = new THREE.Mesh(planeGeometry, material);
      scene.add(plane);

      plane.rotateX(90);
      plane.position.setY(-30);

      // listeners

      // window.addEventListener("mousemove", (e) => {
      //   camera.position.x += (-e.pageX + window.innerWidth / 2) / 50000;
      //   camera.position.y += (-e.pageY + window.innerHeight / 2) / 50000;
      // });

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

      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;

      this.source = this.audio
        ? this.audioCtx.createMediaElementSource(this.audio)
        : null;

      this.source.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);

      const freqs = new Uint8Array(this.analyser.frequencyBinCount);

      //equalizer

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

      const filters = createFilters();

      this.source.connect(filters[0]);
      filters[filters.length - 1].connect(this.audioCtx.destination);

      this.setState({ filters: filters });

      const animate = () => {
        requestAnimationFrame(animate);
        ball.rotation.x += 0.005;
        ball.rotation.y += 0.005;

        plane.rotation.z += 0.003;

        scene.children[scene.children.length - 1].rotation.y += 0.0025;

        if (this.audio && !this.audio.paused) {
          this.analyser.getByteFrequencyData(freqs);

          light.color.setRGB(freqs[9] / 100, freqs[4] / 100, freqs[12] / 100);
          light2.color.setRGB(freqs[15] / 100, freqs[20] / 100, freqs[1] / 100);
        }

        const position = planeGeometry.attributes.position;
        position.usage = THREE.DynamicDrawUsage;

        renderer.render(scene, camera);
      };

      animate();
    }

    fetch(`/api/allUsers`, {
      method: "POST",
      body: JSON.stringify({ q: 5 }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((users) => {
        this.setState({ users: users.users });
        this.charts?.update();
      });
  }

  componentDidUpdate() {
    const actionB = document.querySelectorAll("select");
    window.M.FloatingActionButton.init(actionB, {});
  }

  setUser(user) {
    this.setState({ user });
  }

  handleCheck(e) {
    this.setState({ remember: e.target.checked });
  }

  handleInputChange(e) {
    const { form } = this.state;
    form[e.target.name] = e.target.value;
    this.setState({ form });
  }

  handleModuleSwitch(e) {
    this.setState({ module: e.target.name });
  }

  handleAuth() {
    const { form } = this.state;

    if (form.email && form.password) {
      fetch(`/api/login`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((user) => {
          console.log(user);
          !user.err && this.setState({ user: user._doc });
          !user.err && localStorage.setItem("user", JSON.stringify(user._doc));
          user.err && window.M.toast({ html: user.msg });
        });
    } else {
      window.M.toast({ html: "Enter email or password" });
    }
  }

  handleSceneChange(e) {
    if (this.three[e.target.getAttribute("data-name")]) {
      for (let i in this.three) {
        this.three[i].visible = false;
      }
      this.three[e.target.getAttribute("data-name")].visible = true;
    }
  }

  handleFilesInit(data) {
    const { files } = this.state;
    this.setState({ files: Array.from(new Set([...files, ...data])) });
  }

  hadleLogout() {
    this.setState({ user: null });
    localStorage.removeItem("user");
  }

  handleRegister() {
    const { form } = this.state;

    if (form.email && form.password && form.name && form.surname) {
      fetch(`/api/register`, {
        method: "POST",
        body: JSON.stringify(form),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((user) => {
          this.setState({ module: "login" });
          window.M.toast({ html: user.msg });
        });
    } else {
      window.M.toast({ html: "Enter email and password" });
    }
  }

  handleChangeTab(e) {
    this.setState({ tab: e.target.getAttribute("data-name") });
  }

  render() {
    const { module, user, users, tab } = this.state;
    const { files, frequencies, filters } = this.state;

    console.log(users);

    const usersNames = users ? users.map((e) => `${e.name} ${e.surname}`) : [];
    const usersValues = users ? users.map((e) => +e.score) : [0, 0, 0, 0, 0];

    const filteredFiles = [];
    files.forEach(
      (e) =>
        !filteredFiles.find((el) => el.name === e.name) && filteredFiles.push(e)
    );

    return (
      <div className="Main">
        <audio ref={(e) => (this.audio = e)}></audio>
        <div className="fixed-action-btn">
          <button className="btn-floating btn-large black">
            <i className="large material-icons">3d_rotation</i>
          </button>
          <ul>
            <li>
              <button className="btn-floating black">
                <i
                  className="material-icons"
                  data-name="discoBall"
                  onClick={this.handleSceneChange}>
                  language
                </i>
              </button>
            </li>
            <li>
              <button className="btn-floating black">
                <i
                  className="material-icons"
                  data-name="statue"
                  onClick={this.handleSceneChange}>
                  face
                </i>
              </button>
            </li>
          </ul>
        </div>
        {!user ? (
          <div>
            <header>
              <span className="logo">Player</span>
              <div className="r">
                <button
                  name="login"
                  className="btn waves-effect"
                  onClick={this.handleModuleSwitch}>
                  Login
                </button>
                <button
                  name="register"
                  className="btn waves-effect"
                  onClick={this.handleModuleSwitch}>
                  Registration
                </button>
              </div>
            </header>
            {module === "login" && (
              <div className="form">
                <input
                  type="text"
                  placeholder="email"
                  name="email"
                  onChange={this.handleInputChange}
                />
                <input
                  type="text"
                  placeholder="password"
                  name="password"
                  onChange={this.handleInputChange}
                />
                <p>
                  <label>
                    <input onChange={this.handleCheck} type="checkbox" />
                    <span>Keep me in</span>
                  </label>
                </p>
                <button className="btn waves-effect" onClick={this.handleAuth}>
                  Submit
                </button>
              </div>
            )}

            {module === "register" && (
              <div className="form">
                <input
                  type="text"
                  placeholder="name"
                  name="name"
                  onChange={this.handleInputChange}
                />
                <input
                  type="text"
                  placeholder="surname"
                  name="surname"
                  onChange={this.handleInputChange}
                />
                <input
                  type="text"
                  placeholder="email"
                  name="email"
                  onChange={this.handleInputChange}
                />
                <input
                  type="password"
                  placeholder="password"
                  name="password"
                  onChange={this.handleInputChange}
                />
                <button
                  className="btn waves-effect"
                  onClick={this.handleRegister}>
                  Register
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            {user && (
              <div>
                <ul
                  id="slide-out"
                  className="sidenav"
                  style={{ background: "black" }}>
                  <li>
                    <div className="user-view">
                      <div
                        className="background user-bg"
                        style={{ background: `url(${userBg})` }}></div>
                      <a href="#user">
                        {user.img ? (
                          <img className="circle" src="images/yuna.jpg" />
                        ) : (
                          <i
                            className="material-icons"
                            style={{ fontSize: "60px" }}>
                            account_circle
                          </i>
                        )}
                      </a>
                      <a href="#name">
                        <span className="white-text name">
                          {user.name} {user.surname}
                        </span>
                      </a>
                      <a href="#email">
                        <span className="white-text email">{user.email}</span>
                      </a>
                    </div>
                  </li>
                  <li>
                    <a
                      href="#score"
                      className="item"
                      style={{ color: "white" }}>
                      <i className="material-icons" style={{ color: "white" }}>
                        show_chart
                      </i>
                      Score: {user.score}
                    </a>
                    <a
                      href="#score"
                      className="item"
                      style={{ color: "white" }}>
                      <i className="material-icons" style={{ color: "white" }}>
                        bug_report
                      </i>
                      Feedback
                    </a>
                    <a
                      href="#score"
                      className="item"
                      style={{ color: "white" }}>
                      <i className="material-icons" style={{ color: "white" }}>
                        settings
                      </i>
                      Settings
                    </a>
                  </li>
                  <li>
                    <a href="#!">Second Link</a>
                  </li>
                  <li>
                    <Bar
                      style={{
                        position: "relative",
                        background: `url(${userBg})`,
                        backgroundSize: "cover",
                      }}
                      ref={(e) => (this.charts = e)}
                      data={{
                        labels: usersNames,
                        datasets: [
                          {
                            label: "Most active users",
                            fill: true,
                            borderColor: "aqua",
                            backgroundColor: "aqua",
                            data: usersValues,
                            borderWidth: 1,
                            borderRadius: 35,
                          },
                        ],
                      }}
                      height={100}
                      width={100}
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
                        maintainAspectRatio: false,
                      }}
                    />
                  </li>
                </ul>
                <i
                  style={{
                    cursor: "pointer",
                    position: "absolute",
                    top: "30px",
                    left: "10px",
                  }}
                  data-target="slide-out"
                  className="sidenav-trigger material-icons">
                  menu
                </i>
              </div>
            )}
            <header className="nav-wrapper">
              {user && <User user={user} />}
              <ul className="r centr">
                <li
                  className="r"
                  data-name="player"
                  style={{ color: tab === "player" ? "aqua" : "white" }}
                  onClick={this.handleChangeTab}>
                  <i className="material-icons tiny">music_note</i>
                  <span data-name="player">Player</span>
                </li>
                <li
                  className="r"
                  data-name="audioStudio"
                  style={{ color: tab !== "player" ? "aqua" : "white" }}
                  onClick={this.handleChangeTab}>
                  <i className="material-icons tiny">
                    settings_input_component
                  </i>
                  <span data-name="audioStudio">Audio Studio</span>
                </li>
              </ul>
              <button className="btn waves-effect" onClick={this.hadleLogout}>
                Logout
              </button>
            </header>

            {tab === "player" ? (
              <Player
                initMainFiles={this.handleFilesInit}
                mainData={{
                  audio: this.audio,
                  frequencies,
                  filters,
                  analyser: this.analyser,
                }}
              />
            ) : (
              <Studio
                initMainFiles={this.handleFilesInit}
                files={filteredFiles}
                user={{ user, setUser: this.setUser }}
                mainData={{
                  audio: this.audio,
                  frequencies,
                  filters,
                  analyser: this.analyser,
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  }
}
