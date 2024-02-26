import React from 'react';
import PropTypes from 'prop-types';

import UIkit from 'uikit';

class DropdownTrigger extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.drop) {
      UIkit.dropdown(this.drop, {
        mode: this.props.mode,
        pos: this.props.pos,
        offset: this.props.offset,
      });
    }
  }

  componentWillUnmount() {
    if (this.drop) this.drop = null;
  }

  render() {
    return (
      <div
        ref={(i) => (this.drop = i)}
        className={'uk-position-relative' + (this.props.extraClass ? ' ' + this.props.extraClass : '')}
        aria-haspopup={true}
        aria-expanded={false}
      >
        {this.props.children}
      </div>
    );
  }
}

DropdownTrigger.propTypes = {
  mode: PropTypes.string,
  pos: PropTypes.string,
  offset: PropTypes.number,
  extraClass: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

DropdownTrigger.defaultProps = {
  mode: 'click',
  pos: 'bottom-left',
};

export default DropdownTrigger;
