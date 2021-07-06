import React, { Component } from "react";
import Section from "./Section";

export default class Songs extends Component {
  constructor(props) {
    super(props);
    this.state = { sections: [], active: "All tracks" };

    this.setActive = this.setActive.bind(this);
  }

  componentDidMount() {
    const { songs, sects } = this.props;
    const { sections } = this.state;

    sections.push({ name: "All tracks", tracks: songs });

    this.setState({
      sections: sections,
    });
  }

  setActive(e) {
    this.setState({ active: e.target.textContent });
  }

  render() {
    const { sections, active } = this.state;
    const { audio, sects } = this.props;

    for (let dir in sects) {
      sections.push({ name: dir, tracks: sects[dir] });
    }

    const pureSections = [];

    sections.forEach(
      (e) =>
        !pureSections.find((el) => el.name === e.name) && pureSections.push(e)
    );

    console.log(pureSections);

    const activeSection = sections.find((e) => e.name === active);

    return (
      <div className="Songs c ">
        <div className="r">
          {sections &&
            pureSections.map((e, i) => (
              <div
                key={i}
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
