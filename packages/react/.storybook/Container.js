import React, { Component } from 'react';
import '../src/styles.scss';
import './story-styles.scss';
import './welcome-story.scss';
export default class Container extends Component {
  render() {
    const { story } = this.props;

    return <div className="storybook-container">{story()}</div>;
  }
}
