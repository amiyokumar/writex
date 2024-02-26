/*
   
 *  
 *  Copyright (c) 2014-2019 Trudesk, Inc. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import helpers from 'lib/helpers';

class TruTabSelectors extends React.Component {
  componentDidMount() {
    helpers.setupTruTabs(document.querySelectorAll('.tru-tab-selectors > .tru-tab-selector'));
  }

  render() {
    const { children, showTrack } = this.props;
    return (
      <div className="tru-tab-selectors" style={this.props.style} ref={(r) => (this.selectors = r)}>
        {children}

        <span className="tru-tab-highlighter" />
        {showTrack && <span className="tru-tab-hr tru-tab-hr-lighten" />}
      </div>
    );
  }
}

TruTabSelectors.propTypes = {
  showTrack: PropTypes.bool,
  style: PropTypes.object,
};

TruTabSelectors.defaultProps = {
  showTrack: true,
};

export default TruTabSelectors;
