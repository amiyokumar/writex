import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import $ from 'jquery';

class SpinLoader extends React.Component {
  constructor(props) {
    super(props);

    this.spinnerRef = createRef();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.spinnerRef.current && this.props.animate) {
      const $spinnerRef = $(this.spinnerRef.current);

      // Becoming Active
      if (!prevProps.active && this.props.active) {
        $spinnerRef.css({ opacity: 1 }).show();
      }

      // Becoming Inactive
      if (prevProps.active && !this.props.active) {
        $spinnerRef.animate({ opacity: 0 }, this.props.animateDelay, () => {
          $spinnerRef.hide();
        });
      }
    }
  }

  render() {
    return (
      <div
        ref={this.spinnerRef}
        className={clsx('card-spinner', this.props.extraClass, !this.props.active && !this.props.animate && 'hide')}
        style={this.props.style}
      >
        <div className="spinner" style={this.props.spinnerStyle} />
      </div>
    );
  }
}

SpinLoader.propTypes = {
  active: PropTypes.bool,
  extraClass: PropTypes.string,
  style: PropTypes.object,
  spinnerStyle: PropTypes.object,
  animate: PropTypes.bool,
  animateDelay: PropTypes.number,
};

SpinLoader.defaultProps = {
  animate: false,
  animateDelay: 700,
};

export default SpinLoader;
