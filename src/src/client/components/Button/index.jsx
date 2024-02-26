import React from 'react';
import PropTypes from 'prop-types';
import { merge } from 'lodash';
import helpers from 'lib/helpers';

class Button extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    helpers.UI.waves();
  }

  click() {
    if (this.button) this.button.click();
  }

  render() {
    const { type, small, flat, style, text, icon, onClick, waves, disabled, extraClass, styleOverride, hasDropdown } =
      this.props;
    const classBuild =
      (small ? ' md-btn-small ' : '') +
      (flat ? ' md-btn-flat ' : '') +
      (waves ? ' md-btn-wave ' : '') +
      (style && style && flat ? ' md-btn-flat-' + style : style ? ' md-btn-' + style : '') +
      (disabled ? ' disabled ' : '') +
      ' ' +
      extraClass;
    let renderStyleOverride = styleOverride;
    if (small) {
      if (renderStyleOverride) merge(renderStyleOverride, { maxHeight: '27px' });
      else renderStyleOverride = { maxHeight: '27px' };
      if (hasDropdown) merge(renderStyleOverride, { paddingRight: '12px' });
      if (icon) merge(renderStyleOverride, { padding: '0 10px' });
    }
    return (
      <button
        className={'uk-clearfix md-btn' + classBuild}
        onClick={onClick}
        type={type ? type : 'button'}
        disabled={disabled}
        style={renderStyleOverride}
        ref={(r) => (this.button = r)}
      >
        {icon && (
          <i className={'material-icons'} style={{ fontSize: '18px', margin: '5px 0' }}>
            {icon}
          </i>
        )}
        {text && <div className={'uk-float-left uk-width-1-1 uk-text-center'}> {text}</div>}
        {hasDropdown && (
          <i className={'material-icons'} style={{ fontSize: '18px', margin: '5px 0 0 5px' }}>
            
          </i>
        )}
      </button>
    );
  }
}

Button.propTypes = {
  type: PropTypes.string,
  text: PropTypes.string,
  icon: PropTypes.string,
  flat: PropTypes.bool,
  style: PropTypes.string,
  styleOverride: PropTypes.object,
  hasDropdown: PropTypes.bool,
  small: PropTypes.bool,
  waves: PropTypes.bool,
  disabled: PropTypes.bool,
  extraClass: PropTypes.string,
  onClick: PropTypes.func,
};

Button.defaultProps = {
  disabled: false,
  hasDropdown: false,
  flat: false,
  waves: true,
  type: 'button',
};

export default Button;
