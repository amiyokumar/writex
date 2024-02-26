import React from 'react';
import PropTypes from 'prop-types';

class PermSwitchPartial extends React.Component {
  render() {
    const { title, checked, onChange, disabled } = this.props;
    return (
      <div>
        <div style={{ padding: '0 10px' }}>
          <div className="uk-clearfix">
            <div className="left">
              <h6 style={{ padding: '0 0 0 15px', margin: '20px 0', fontSize: '16px', lineHeight: '14px' }}>{title}</h6>
            </div>
            <div className="right" style={{ position: 'relative' }}>
              <div className="md-switch md-green" style={{ margin: '18px 0 0 0' }}>
                <label>
                  Allow
                  <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
                  <span className="lever" />
                </label>
              </div>
            </div>
          </div>
        </div>
        <hr className="nomargin-top clear" />
      </div>
    );
  }
}

PermSwitchPartial.propTypes = {
  title: PropTypes.string.isRequired,
  checked: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};

export default PermSwitchPartial;
