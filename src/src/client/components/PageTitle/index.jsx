import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

class PageTitle extends React.Component {
  render() {
    const { title, rightComponent, shadow, hideBorderBottom, extraClasses } = this.props;
    return (
      <div className={clsx('nopadding', extraClasses)}>
        <div
          className={clsx(
            'uk-width-1-1',
            'page-title',
            'pl-25',
            'uk-clearfix',
            hideBorderBottom ? 'nbb' : 'dt-borderBottom',
            !shadow && 'noshadow'
          )}
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <p style={{ flexGrow: 1 }}>{title}</p>
          <div>{rightComponent}</div>
        </div>
      </div>
    );
  }
}

PageTitle.propTypes = {
  title: PropTypes.string.isRequired,
  shadow: PropTypes.bool,
  hideBorderBottom: PropTypes.bool,
  extraClasses: PropTypes.string,
  rightComponent: PropTypes.element,
};

PageTitle.defaultProps = {
  shadow: false,
  hideBorderBottom: false,
};

export default PageTitle;
