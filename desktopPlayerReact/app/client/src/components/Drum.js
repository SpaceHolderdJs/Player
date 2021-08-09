import React, { Component } from "react";

export default class Drum extends Component {
  constructor(props) {
    super(props);
    this.state = {
      btnsQuantity: 3,
      letters: ["r", "t", "y", "f", "g", "h", "v", "b", "n"],
      isLocked: true,
      sounds: [],
      connecting: false,
      cntBtn: null,
      soundsLinks: {},
    };

    this.handleLock = this.handleLock.bind(this);

    this.handleInitSounds = this.handleInitSounds.bind(this);
    this.handleConnectSound = this.handleConnectSound.bind(this);
  }

  componentDidMount() {
    //initing buttons
    const { btnsQuantity, letters, soundsLinks } = this.state;

    const buttons = [];

    for (let i = 0; i < btnsQuantity * btnsQuantity; i++) {
      buttons.push(i);
    }

    letters.forEach((e) => (soundsLinks[e] = ""));

    this.setState({ buttons });

    window.addEventListener("keydown", (e) => {
      const { isLocked, soundsLinks } = this.state;

      if (this.btnParent) {
        const btn = [...this.btnParent.children].find(
          (el) => el.getAttribute("data-l") === e.key.toLowerCase()
        );

        if (btn && !isLocked) {
          const aud = btn.querySelector("audio");
          soundsLinks[e.key].length > 1 && aud.play();
          btn.style.boxShadow = "0px 0px 10px 5px red";
          btn.style.transform = "scale(1.1)";
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      const { isLocked, soundsLinks } = this.state;

      if (this.btnParent) {
        const btn = [...this.btnParent.children].find(
          (el) => el.getAttribute("data-l") === e.key.toLowerCase()
        );

        if (btn && !isLocked) {
          const aud = btn.querySelector("audio");
          if (soundsLinks[e.key].length > 1) {
            aud.pause();
            aud.currentTime = 0;
          }
          btn.style.boxShadow = "none";
          btn.style.transform = "none";
        }
      }
    });
  }

  handleLock() {
    this.setState({ isLocked: !this.state.isLocked });
  }

  handleInitSounds(e) {
    const { sounds } = this.state;
    const f = Object.values(e.target.files).filter((el) =>
      el.type.includes("audio")
    );

    f.forEach(
      (e) => !sounds.find((el) => el.name === e.name) && sounds.push(e)
    );

    this.setState({ sounds });
  }

  handleConnectSound(e) {
    const { isLocked, soundsLinks } = this.state;
    if (!isLocked) {
      this.setState({
        connecting: true,
        cntBtn: e.target.getAttribute("data-l")
          ? e.target
          : e.target.parentElement,
      });
    }
  }

  render() {
    const {
      btnsQuantity,
      buttons,
      letters,
      isLocked,
      connecting,
      cntBtn,
      sounds,
      soundsLinks,
    } = this.state;

    return (
      <div className="r centr Drum">
        <div className="c centr">
          <h6 className="r centr">
            Electro-drum{" "}
            <i
              className="material-icons"
              onClick={this.handleLock}
              style={{ cursor: "pointer" }}>
              {isLocked ? "lock_outline" : "lock_open"}
            </i>
          </h6>
          <div
            className="r btn-wrapper"
            ref={(e) => (this.btnParent = e)}
            style={{ flexWrap: "wrap" }}>
            {buttons?.map((e, i) => (
              <div
                className={`drum-btn ${isLocked && "locked-btn"} ${
                  !isLocked &&
                  cntBtn?.getAttribute("data-l") === letters[i] &&
                  "selecting"
                }`}
                key={i}
                data-l={letters[i]}
                onClick={this.handleConnectSound}>
                <audio src={soundsLinks[letters[i]]} />
                <span style={{ margin: "5px" }}>
                  {letters[i].toLocaleUpperCase()}
                </span>
                {soundsLinks[letters[i]] !== "" && (
                  <i className="material-icons" style={{ fontSize: "15px" }}>
                    music_note
                  </i>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="c sounds-wrapper">
          <h6 className="r centr">
            Sounds
            <label
              htmlFor="sounds"
              className="btn waves-effect btn-small label">
              <i className="material-icons">library_music</i>
            </label>
            <input
              id="sounds"
              type="file"
              webkitdirectory="true"
              multiple
              onChange={this.handleInitSounds}
              placeholder="Select files"
              hidden
            />
          </h6>
          {connecting && (
            <span className="tip">
              Select sound for{" "}
              {cntBtn.getAttribute("data-l").toUpperCase() || "this"} button
              <span
                className="cnsl"
                onClick={() => {
                  this.setState({ connecting: false, cntBtn: null });
                }}>
                Cancel
              </span>
            </span>
          )}
          {sounds.length > 0 &&
            sounds.map((e, i) => (
              <span key={i} className="r centr sound" data-path={e.path}>
                {e.name}
                <div className="r">
                  <audio src={e.path}></audio>
                  {soundsLinks &&
                    Object.keys(soundsLinks)[
                      Object.values(soundsLinks).findIndex(
                        (el) => el === e.path
                      )
                    ]?.toUpperCase()}
                  <i
                    className="material-icons"
                    data-path={e.path}
                    onClick={(evt) => {
                      const aud =
                        evt.target.parentElement.querySelector("audio");
                      aud.play();
                    }}>
                    play_arrow
                  </i>

                  {connecting && (
                    <i
                      className="material-icons"
                      data-path={e.path}
                      onClick={(evt) => {
                        const { cntBtn, soundsLinks } = this.state;
                        soundsLinks[cntBtn.getAttribute("data-l")] =
                          evt.target.getAttribute("data-path");
                        this.setState({ connecting: false, cntBtn: null });
                      }}>
                      add
                    </i>
                  )}
                </div>
              </span>
            ))}
        </div>
      </div>
    );
  }
}
