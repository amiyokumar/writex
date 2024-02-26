import React from 'react';
import PropTypes from 'prop-types';

import helpers from 'lib/helpers';

class NoticeBanner extends React.Component {
  render() {
    const { notice } = this.props;
    const dateFormatted = helpers.formatDate(
      notice.get('activeDate,'),
      helpers.getShortDateFormat() + ', ' + helpers.getTimeFormat()
    );

    return (
      <div
        id={'notice-banner'}
        style={{
          width: '100%',
          height: '30px',
          background: notice.get('color'),
          color: notice.get('fontColor'),
          fontSize: '13px',
          fontWeight: '500',
          textAlign: 'center',
          paddingTop: '7px',
        }}
      >
        {dateFormatted} Important: {notice.get('message')}
      </div>
    );
  }
}

NoticeBanner.propTypes = {
  notice: PropTypes.object.isRequired,
};

export default NoticeBanner;
