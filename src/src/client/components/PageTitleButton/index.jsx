import React from 'react';
import PropTypes from 'prop-types';

class PageTitleButton extends React.Component {
  render() {
    return (
      <div className={'pagination uk-float-left'}>
        <ul className="button-group uk-float-left">
          <li className="pagination relative">
            <a
              href={this.props.href}
              className={'btn no-ajaxy'}
              style={{ borderRadius: 3 }}
              onClick={this.props.onButtonClick}
            >
              {this.props.fontAwesomeIcon && <i className={`fa fa-large ${this.props.fontAwesomeIcon}`} />}
              {this.props.mdIcon && <i className={'material-icons'}>{this.props.mdIcon}</i>}
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

PageTitleButton.propTypes = {
  href: PropTypes.string.isRequired,
  fontAwesomeIcon: PropTypes.string,
  mdIcon: PropTypes.string,
  onButtonClick: PropTypes.func,
};

PageTitleButton.defaultProps = {
  href: '#',
};

export default PageTitleButton;
