/*
   
 *  
 *  Copyright (c) 2014-2019 Trudesk, Inc. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';

class TruTabWrapper extends React.Component {
  render() {
    return (
      <div className="tru-tabs uk-clearfix" style={this.props.style || { padding: '20px 0' }}>
        {this.props.children}
      </div>
    );
  }
}

TruTabWrapper.propTypes = {
  style: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

export default TruTabWrapper;
