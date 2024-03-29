import React from 'react';
import PropTypes from 'prop-types';

import $ from 'jquery';

class TitlePagination extends React.Component {
  componentDidMount() {}
  componentDidUpdate() {
    $(this.parent).ajaxify();
  }

  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  static calcStartEnd(page, limit) {
    page = Number(page);
    limit = Number(limit);
    const start = page === 0 ? '1' : page * limit;
    const end = page === 0 ? limit : page * limit + limit;

    return { start, end };
  }

  render() {
    const { limit, total, prevEnabled, nextEnabled, currentPage, prevPage, nextPage, type, filter } = this.props;
    const link = (page) => {
      if (!type) return '#';
      if (type.toLowerCase() === 'filter') {
        return `${filter.raw}&page=${page}`;
      } else {
        return `/tickets/${type}/page/${page}/`;
      }
    };

    const startEnd = TitlePagination.calcStartEnd(currentPage, limit);

    return (
      <div className={'pagination uk-float-left uk-clearfix'} ref={(r) => (this.parent = r)}>
        <span className={'pagination-info'}>
          {TitlePagination.formatNumber(startEnd.start)} - {TitlePagination.formatNumber(startEnd.end)} of{' '}
          {TitlePagination.formatNumber(total)}
        </span>
        <ul className={'button-group'}>
          <li className="pagination">
            <a
              href={prevEnabled ? link(prevPage) : '#'}
              title={'Previous Page'}
              className={'btn md-btn-wave-light' + (!prevEnabled ? ' no-ajaxy' : '')}
            >
              <i className="fa fa-large fa-chevron-left" />
            </a>
          </li>
          <li className="pagination">
            <a
              href={nextEnabled ? link(nextPage) : '#'}
              title={'Next Page'}
              className={'btn md-btn-wave-light' + (!nextEnabled ? ' no-ajaxy' : '')}
            >
              <i className="fa fa-large fa-chevron-right" />
            </a>
          </li>
        </ul>
      </div>
    );
  }
}

TitlePagination.propTypes = {
  limit: PropTypes.number,
  total: PropTypes.string,
  type: PropTypes.string,
  filter: PropTypes.object,
  prevEnabled: PropTypes.bool.isRequired,
  nextEnabled: PropTypes.bool.isRequired,
  currentPage: PropTypes.string,
  prevPage: PropTypes.number,
  nextPage: PropTypes.number,
};

TitlePagination.defaultProps = {
  limit: 50,
  prevPage: 0,
  nextPage: 1,
};

export default TitlePagination;
