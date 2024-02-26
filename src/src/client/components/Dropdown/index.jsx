import React from 'react';
import PropTypes from 'prop-types';

class Dropdown extends React.Component {
  render() {
    const { small, width, children, extraClass } = this.props;
    const className = (small ? ' uk-dropdown-small ' : ' ') + (extraClass || '');
    return (
      <div
        className={'nopadding-left nopadding-right uk-dropdown uk-margin-top-remove' + className}
        style={{ width: width, minWidth: width }}
      >
        <ul className="uk-nav uk-topbar nomargin">{children}</ul>
      </div>
    );
  }
}

Dropdown.propTypes = {
  small: PropTypes.bool,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  extraClass: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

Dropdown.defaultProps = {
  width: 150,
};

export default Dropdown;
