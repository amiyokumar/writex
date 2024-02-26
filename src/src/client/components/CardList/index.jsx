import React from 'react';
import PropTypes from 'prop-types';

import helpers from 'lib/helpers';

class CardList extends React.Component {
  componentDidMount() {
    helpers.UI.hierarchicalSlide();
  }

  render() {
    const { header, headerRightComponent, children, extraClass } = this.props;
    return (
      <div className={'md-card-list-wrapper' + (extraClass ? ' ' + extraClass : '')}>
        <div className={'md-card-list'}>
          {header && <div className={'md-card-list-header heading_list'}>{header}</div>}
          {headerRightComponent && <div className={'md-card-list-header-right'}>{headerRightComponent}</div>}
          <ul className={'hierarchical_slide'} data-delay="100ms">
            {children}
          </ul>
        </div>
      </div>
    );
  }
}

CardList.propTypes = {
  header: PropTypes.string,
  headerRightComponent: PropTypes.element,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
  extraClass: PropTypes.string,
};

export default CardList;
