import React from 'react';
import PropTypes from 'prop-types';

class DropdownItem extends React.Component {
  onClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  render() {
    const { closeOnClick, text, href, extraClass } = this.props;
    return (
      <li className={closeOnClick ? 'uk-dropdown-close' : ''}>
        <a
          href={href}
          close-uk-dropdown={closeOnClick.toString()}
          className={(!href ? 'no-ajaxy' : '') + (extraClass ? ' ' + extraClass : '')}
          onClick={this.props.onClick}
        >
          {text}
        </a>
      </li>
    );
  }
}

DropdownItem.propTypes = {
  href: PropTypes.string,
  text: PropTypes.string.isRequired,
  extraClass: PropTypes.string,
  onClick: PropTypes.func,
  closeOnClick: PropTypes.bool,
};

DropdownItem.defaultProps = {
  closeOnClick: true,
};

export default DropdownItem;
