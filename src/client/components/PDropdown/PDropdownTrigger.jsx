import React, { createRef } from 'react';
import PropTypes from 'prop-types';

class PDropdownTrigger extends React.Component {
  containerRef = createRef();

  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState, snapshot) {}

  componentWillUnmount() {}

  onTargetClick(e) {
    e.preventDefault();
    if (this.props.target && this.props.target.current && typeof this.props.target.current.show === 'function') {
      this.props.target.current.show(this.containerRef.current);
    }
  }

  render() {
    return (
      <div ref={this.containerRef} className={'uk-clearfix'} onClick={(e) => this.onTargetClick(e)}>
        {this.props.children}
      </div>
    );
  }
}

PDropdownTrigger.propTypes = {
  target: PropTypes.any.isRequired,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default PDropdownTrigger;
