/*
   
 *  
 *  Copyright (c) 2014-2019 Trudesk, Inc. All rights reserved.
 */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

class TruTabSelector extends React.Component {
  render() {
    const { label, active, selectorId, showBadge, badgeText } = this.props;
    return (
      <Fragment>
        <a
          role={'button'}
          className={clsx('tru-tab-selector no-ajaxy', active && 'active')}
          data-tabid={selectorId}
          onClick={(e) => e.preventDefault()}
        >
          {label}
          {showBadge && <span className="uk-badge uk-badge-grey uk-badge-small">{badgeText}</span>}
        </a>
      </Fragment>
    );
  }
}

TruTabSelector.propTypes = {
  label: PropTypes.string.isRequired,
  active: PropTypes.bool,
  selectorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  showBadge: PropTypes.bool,
  badgeText: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

TruTabSelector.defaultProps = {
  active: false,
  showBadge: false,
};

export default TruTabSelector;
