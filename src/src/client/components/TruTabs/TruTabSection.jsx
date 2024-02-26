/*
   
 *  
 *  Copyright (c) 2014-2019 Trudesk, Inc. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

class TruTabSection extends React.Component {
  render() {
    const { sectionId, active } = this.props;
    return (
      <div
        className={clsx('tru-tab-section', !active && 'hidden')}
        data-tabid={sectionId}
        style={this.props.style || { paddingTop: 20 }}
      >
        {this.props.children}
      </div>
    );
  }
}

TruTabSection.propTypes = {
  sectionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  active: PropTypes.bool.isRequired,
  style: PropTypes.object,
};

TruTabSection.defaultProps = {
  active: false,
};

export default TruTabSection;
