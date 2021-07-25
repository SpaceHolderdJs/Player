import React, { Component } from "react";

export default class User extends Component {
  render() {
    const { user } = this.props;

    return (
      <div style={{ marginLeft: "30px" }}>
        {user && (
          <h5>
            {user.name} {user.surname}
          </h5>
        )}
      </div>
    );
  }
}
