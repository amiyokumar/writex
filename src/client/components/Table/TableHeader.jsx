import React from 'react';
import PropTypes from 'prop-types';

class TableHeader extends React.Component {
  render() {
    const { width, height, padding, textAlign, text, component } = this.props;

    return (
      <th
        style={{
          width: width,
          padding: padding,
          height: height,
          verticalAlign: 'middle',
          fontSize: 12,
          textTransform: 'uppercase',
          textAlign: textAlign,
        }}
      >
        {component}
        {text}
      </th>
    );
  }
}

TableHeader.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  padding: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  textAlign: PropTypes.string,
  text: PropTypes.string,
  component: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
};

TableHeader.defaultProps = {
  textAlign: 'left',
};

export default TableHeader;
