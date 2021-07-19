import React, { Component } from "react";

import User from "./User";
import Player from "./Player";
import Studio from "./Studio";

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      module: "login",
      form: {},
      tab: "player",
      files: [],
    };

    this.handleAuth = this.handleAuth.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.hadleLogout = this.hadleLogout.bind(this);
    this.handleModuleSwitch = this.handleModuleSwitch.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleChangeTab = this.handleChangeTab.bind(this);
    this.handleFilesInit = this.handleFilesInit.bind(this);
  }

  componentDidMount() {
    // auth

    localStorage.getItem("user") &&
      this.setState({ user: JSON.parse(localStorage.getItem("user")) });

    console.log(localStorage.getItem("user"));

    // THREE
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
    console.log(e.target.getAttribute("name"));
    this.setState({ tab: e.target.getAttribute("data-name") });
  }

  render() {
    const { module, user, tab } = this.state;

    if (!user) {
      return (
        <div className="Main">
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
      );
    } else {
      const { files } = this.state;

      const filteredFiles = [];
      files.forEach(
        (e) =>
          !filteredFiles.find((el) => el.name === e.name) &&
          filteredFiles.push(e)
      );

      return (
        <div className="Main">
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
                <i className="material-icons tiny">settings_input_component</i>
                <span data-name="audioStudio">Audio Studio</span>
              </li>
            </ul>
            <button className="btn waves-effect" onClick={this.hadleLogout}>
              Logout
            </button>
          </header>
          {tab === "player" ? (
            <Player initMainFiles={this.handleFilesInit} />
          ) : (
            <Studio
              initMainFiles={this.handleFilesInit}
              files={filteredFiles}
            />
          )}
        </div>
      );
    }
  }
}
