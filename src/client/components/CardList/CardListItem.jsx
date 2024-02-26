import React from 'react';
import PropTypes from 'prop-types';

class CardListItem extends React.Component {
  render() {
    const { children } = this.props;
    return (
      <li className={'uk-clearfix'} style={{ minHeight: 34 }}>
        {children}
      </li>
    );
  }
}

CardListItem.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

export default CardListItem;
