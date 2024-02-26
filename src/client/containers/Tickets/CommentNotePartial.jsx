/*
   
 *  
 *  Copyright (c) 2014-2019 Trudesk, Inc. All rights reserved.
 */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ReactHtmlParser from 'react-html-parser';
import Avatar from 'components/Avatar/Avatar';

import helpers from 'lib/helpers';

const setupImages = (parent) => {
  const imagesEl = parent.body.querySelectorAll('img:not(.hasLinked)');
  imagesEl.forEach((i) => helpers.setupImageLink(i));
};

const setupLinks = (parent) => {
  const linksEl = parent.body.querySelectorAll('a');
  linksEl.forEach((i) => helpers.setupLinkWarning(i));
};

class CommentNotePartial extends React.Component {
  componentDidMount() {
    setupImages(this);
    setupLinks(this);
  }

  componentDidUpdate() {
    setupImages(this);
    setupLinks(this);
  }

  componentWillUnmount() {}

  render() {
    const { ticketSubject, comment, isNote, dateFormat, onEditClick, onRemoveClick, isQuery, onMarkAsResolved } =
      this.props;
    const dateFormatted = helpers.formatDate(comment.date, dateFormat);
    return (
      <div className="ticket-comment">
        <Avatar image={comment.owner.image} userId={comment.owner._id} />
        <div className="issue-text">
          <h3>Re: {ticketSubject}</h3>
          {/* {!isQuery && (
            <a className="comment-email-link" href={`mailto:${comment.owner.email}`}>
              {comment.owner.fullname} &lt;{comment.owner.email}&gt;
            </a>
          )} */}
          {<a>{comment.owner._id}</a>}
          <br />
          <time dateTime={dateFormatted} title={dateFormatted} data-uk-tooltip="{delay: 200}">
            {helpers.calendarDate(comment.date)}
          </time>

          <br />
          {isNote && <span className="uk-badge uk-badge-small nomargin-left-right text-white bg-info">NOTE</span>}
          {isQuery && <span className="uk-badge uk-badge-small nomargin-left-right text-white bg-danger">QUERY</span>}
          <div className="comment-body" style={{ marginTop: 10 }} ref={(r) => (this.body = r)}>
            {isNote && <Fragment>{ReactHtmlParser(comment.note)}</Fragment>}
            {isQuery && <Fragment>{ReactHtmlParser(comment.query)}</Fragment>}
            {!isNote && !isQuery && <Fragment>{ReactHtmlParser(comment.comment)}</Fragment>}
          </div>
          {comment.resolved && (
            <div>
              <span className="uk-badge uk-badge-small nomargin-left-right text-white bg-success">RESOLVED</span>
              <br />
              <time dateTime={dateFormatted} title={dateFormatted} data-uk-tooltip="{delay: 200}">
                {helpers.calendarDate(comment.updated)}
              </time>
            </div>
          )}
        </div>
        {this.props.ticketStatus.get('isResolved') === false && !comment.resolved && (
          <div className="comment-actions">
            {helpers.canUser('comments:delete', true) && (
              <div className="remove-comment" onClick={onRemoveClick}>
                <i className="material-icons">&#xE5CD;</i>
              </div>
            )}
            {helpers.canUser('comments:update', true) && (
              <div className="edit-comment" onClick={onEditClick}>
                <i className="material-icons">&#xE254;</i>
              </div>
            )}
            {isQuery && helpers.canUser('comments:update', true) && (
              <div className="resolve-query" onClick={onMarkAsResolved}>
                <i className="material-icons">&#xE876;</i>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}

CommentNotePartial.propTypes = {
  ticketStatus: PropTypes.object.isRequired,
  ticketSubject: PropTypes.string.isRequired,
  comment: PropTypes.object.isRequired,
  dateFormat: PropTypes.string.isRequired,
  isNote: PropTypes.bool.isRequired,
  isNote: PropTypes.bool.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onRemoveClick: PropTypes.func.isRequired,
};

CommentNotePartial.defaultProps = {
  isNote: false,
  isQuery: false,
};

export default CommentNotePartial;
