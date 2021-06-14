import React, { Component } from "react";

import User from "./User";
import Player from "./Player";

export default class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      module: "login",
      form: {},
    };

    this.handleAuth = this.handleAuth.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.hadleLogout = this.hadleLogout.bind(this);
    this.handleModuleSwitch = this.handleModuleSwitch.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
  }

  componentDidMount() {
    // window.M.Toast.init();
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
          user.err && window.M.toast({ html: user.msg });
        });
    } else {
      window.M.toast({ html: "Enter email or password" });
    }
  }

  hadleLogout() {
    this.setState({ user: null });
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

  render() {
    const { module, user } = this.state;

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
      return (
        <div className="Main">
          <header>
            {user && <User user={user} />}
            <button className="btn waves-effect" onClick={this.hadleLogout}>
              Logout
            </button>
          </header>
          <Player />
        </div>
      );
    }
  }
}
