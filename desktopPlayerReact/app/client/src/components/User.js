import React, { Component } from "react";

export default class User extends Component {
  constructor(props) {
    super(props);
    this.state = { more: false };

    this.handleMore = this.handleMore.bind(this);
  }

  handleMore() {
    this.setState({ more: !this.state.more });
  }

  render() {
    const { user } = this.props;
    const { more } = this.state;

    return (
      <div>
        {user && (
          <h1 onClick={this.handleMore}>
            {user.name} {user.surname}
          </h1>
        )}
        {more && <h3>Some more info ...</h3>}
      </div>
    );
  }
}
