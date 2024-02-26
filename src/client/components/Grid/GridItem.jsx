import React from 'react';
import PropTypes from 'prop-types';

class GridItem extends React.Component {
  render() {
    const { width, xLargeWidth, extraClass } = this.props;
    return (
      <div
        className={
          'uk-width-' +
          width +
          (xLargeWidth ? ' uk-width-xLarge-' + xLargeWidth : '') +
          (extraClass ? ' ' + extraClass : '')
        }
        style={this.props.style}
      >
        {this.props.children}
      </div>
    );
  }
}

GridItem.propTypes = {
  width: PropTypes.string.isRequired,
  xLargeWidth: PropTypes.string,
  extraClass: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default GridItem;
