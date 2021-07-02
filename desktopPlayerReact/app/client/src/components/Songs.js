import React, { Component } from "react";

export default class Songs extends Component {
  constructor(props) {
    super(props);
    this.state = { more: false };

    this.handleMore = this.handleMore.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
  }

  handleMore() {
    this.setState({ more: !this.state.more });
  }

  handlePlay(e) {
    const { audio, songs } = this.props;
    audio.load();
    audio.setAttribute("data-name", e.target.getAttribute("data-name"));
    audio.src = e.target.getAttribute("data-path");
    audio.play();
  }

  render() {
    const { songs, audio } = this.props;
    const { more } = this.state;

    if (more) {
      return (
        <div className="Songs c ">
          {songs &&
            songs.map((e, i) => (
              <div key={i} className="song r">
                <span>{e.name}</span>
                <i
                  onClick={this.handlePlay}
                  data-path={e.path}
                  data-name={e.name}
                  className="material-icons">
                  play_arrow
                </i>
                {audio &&
                  audio.getAttribute("data-name") &&
                  audio.getAttribute("data-name") === e.name && (
                    <div className="r playing-wrapper">
                      <div className="playing playing0"></div>
                      <div className="playing playing1"></div>
                      <div className="playing playing2"></div>
                    </div>
                  )}
              </div>
            ))}
          <button onClick={this.handleMore} className="btn waves-effect">
            Close
          </button>
        </div>
      );
    } else {
      return (
        <button onClick={this.handleMore} className="btn waves-effect">
          All songs ({songs.length})
        </button>
      );
    }
  }
}
