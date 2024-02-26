import React from 'react';
import PropTypes from 'prop-types';

class Grid extends React.Component {
  render() {
    return (
      <div
        className={
          'uk-grid uk-clearfix' +
          (this.props.gutterSize ? ' uk-grid-' + this.props.gutterSize : '') +
          (this.props.collapse ? ' uk-grid-collapse' : '') +
          (this.props.extraClass ? ' ' + this.props.extraClass : '')
        }
        style={this.props.style}
      >
        {this.props.children}
      </div>
    );
  }
}

Grid.propTypes = {
  extraClass: PropTypes.string,
  gutterSize: PropTypes.string,
  collapse: PropTypes.bool,
  style: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

Grid.defaultProps = {
  collapse: false,
};

export default Grid;
