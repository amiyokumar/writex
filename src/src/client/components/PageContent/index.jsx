import React from 'react';
import PropTypes from 'prop-types';

import helpers from 'lib/helpers';

class PageContent extends React.Component {
  componentDidMount() {
    helpers.resizeFullHeight();
    helpers.setupScrollers();
  }

  render() {
    return (
      <div
        id={this.props.id}
        className={'page-content no-border-top full-height scrollable ' + (this.props.extraClass || '')}
        style={{ padding: this.props.padding }}
      >
        <div style={{ paddingBottom: this.props.paddingBottom }}>{this.props.children}</div>
      </div>
    );
  }
}

PageContent.propTypes = {
  id: PropTypes.string,
  padding: PropTypes.number,
  paddingBottom: PropTypes.number,
  extraClass: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

PageContent.defaultProps = {
  padding: 25,
  paddingBottom: 100,
};

export default PageContent;
