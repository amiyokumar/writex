import React from 'react';
import PropTypes from 'prop-types';

class OffCanvas extends React.Component {
  render() {
    const { title, id, children } = this.props;
    return (
      <div id={id} className={'uk-offcanvas'}>
        <div className="uk-offcanvas-bar uk-offcanvas-bar-flip scrollable">
          {title && (
            <div className="uk-offcanvas-title">
              <h3>{title}</h3>
            </div>
          )}
          {children}
        </div>
      </div>
    );
  }
}

OffCanvas.propTypes = {
  title: PropTypes.string,
  id: PropTypes.string.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default OffCanvas;
