import React, { Component } from "react";
import Section from "./Section";

export default class Songs extends Component {
  constructor(props) {
    super(props);
    this.state = { sections: [], active: "All tracks" };

    this.handlePlay = this.handlePlay.bind(this);
    this.addSection = this.addSection.bind(this);
    this.deleteSection = this.deleteSection.bind(this);
    this.setActive = this.setActive.bind(this);
  }

  componentDidMount() {
    const { songs, sects } = this.props;
    const { sections } = this.state;

    sections.push({ name: "All tracks", tracks: songs });

    for (let dir in sects) {
      sections.push({ name: dir, tracks: sects[dir] });
    }

    this.setState({
      sections: sections,
    });
  }

  setActive(e) {
    this.setState({ active: e.target.textContent });
  }

  addSection(elms) {
    const { sections } = this.state;
    this.setState({ sections: sections.push(elms) });
  }

  deleteSection(name) {
    const { sections } = this.state;
    this.setState({ sections: sections.filter((e) => e.name !== name) });
  }

  handlePlay(e) {
    const { audio, songs } = this.props;
    audio.load();
    audio.setAttribute("data-name", e.target.getAttribute("data-name"));
    audio.src = e.target.getAttribute("data-path");
    audio.play();
  }

  render() {
    const { sections, active } = this.state;
    const { audio } = this.props;

    const activeSection = sections.find((e) => e.name === active);

    return (
      <div className="Songs c ">
        <div className="r">
          {sections &&
            sections.map((e) => (
              <div
                name={e.name}
                onClick={this.setActive}
                className={`crumb ${
                  e.name === active && "active"
                } waves-effect`}>
                {e.name}
              </div>
            ))}
        </div>
        {activeSection && (
          <Section
            name={activeSection.name}
            tracks={activeSection.tracks}
            audio={audio}
          />
        )}
      </div>
    );
  }
}
