import React from 'react';
import PropTypes from 'prop-types';

class TableRow extends React.Component {
  render() {
    const { clickable } = this.props;
    const clickableStyle = { cursor: 'pointer' };
    let style = this.props.style;
    if (clickable) {
      style = this.props.style ? Object.assign(this.props.style, clickableStyle) : clickableStyle;
    } else {
      style = this.props.style ? Object.assign(this.props.style, { cursor: 'default' }) : { cursor: 'default' };
    }
    return (
      <tr className={this.props.className} style={style} onClick={this.props.onClick}>
        {this.props.children}
      </tr>
    );
  }
}

TableRow.propTypes = {
  clickable: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.any,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

TableRow.defaultProps = {
  clickable: false,
};

export default TableRow;
