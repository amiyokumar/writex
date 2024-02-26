import React from 'react';
import PropTypes from 'prop-types';

class TableCell extends React.Component {
  render() {
    return <td {...this.props}>{this.props.children}</td>;
  }
}

TableCell.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default TableCell;
