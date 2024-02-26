import React from 'react';
import PropTypes from 'prop-types';

import helpers from 'lib/helpers';

class Table extends React.Component {
  render() {
    const { headers, striped, stickyHeader, children, extraClass, useBody } = this.props;
    const tableClass =
      'uk-table' +
      (striped ? ' uk-table-striped stripe' : '') +
      (stickyHeader ? ' sticky-header fixed-width' : '') +
      (extraClass ? ' ' + extraClass : '');
    return (
      <table className={tableClass} style={this.props.style} ref={this.props.tableRef}>
        {headers && (
          <thead>
            <tr>{headers}</tr>
          </thead>
        )}
        {useBody && <tbody className={'scrollable full-height c91-fix'}>{children}</tbody>}
        {!useBody && children}
      </table>
    );
  }
}

Table.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.element),
  tableRef: PropTypes.func,
  striped: PropTypes.bool,
  stickyHeader: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  style: PropTypes.object,
  extraClass: PropTypes.string,
  useBody: PropTypes.bool,
};

Table.defaultProps = {
  striped: true,
  stickyHeader: true,
  useBody: true,
};

export default Table;
