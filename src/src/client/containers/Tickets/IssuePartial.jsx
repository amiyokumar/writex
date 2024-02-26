/*
   
 *  
 *  Copyright (c) 2014-2019 Trudesk, Inc. All rights reserved.
 */

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';

import Avatar from 'components/Avatar/Avatar';
import ReactHtmlParser from 'react-html-parser';

import { TICKETS_ISSUE_SET, TICKETS_UI_ATTACHMENTS_UPDATE } from 'serverSocket/socketEventConsts';

import helpers from 'lib/helpers';
import axios from 'axios';
import Log from '../../logger';

const setupImages = (parent) => {
  const imagesEl = parent.issueBody.querySelectorAll('img:not(.hasLinked)');
  imagesEl.forEach((i) => helpers.setupImageLink(i));
};

const setupLinks = (parent) => {
  const linksEl = parent.issueBody.querySelectorAll('a');
  linksEl.forEach((i) => helpers.setupLinkWarning(i));
};

@observer
class IssuePartial extends React.Component {
  @observable ticketId = '';
  @observable status = null;
  @observable owner = null;
  @observable subject = '';
  @observable issue = '';
  @observable attachments = [];
  @observable module = '';
  @observable universityName = '';
  @observable verdict = '';
  @observable wordCount = '';
  @observable marks = '';
  @observable invoiceAmount = '';
  @observable workCategory = '';
  @observable currency = '';
  @observable ticketType = '';

  constructor(props) {
    super(props);
    makeObservable(this);

    // this.state = { fileUrl: '', showPreview: false };

    this.ticketId = this.props.ticketId;
    this.status = this.props.status;
    this.owner = this.props.owner;
    this.subject = this.props.subject;
    this.issue = this.props.issue;
    this.attachments = this.props.attachments;
    this.module = this.props.module;
    this.universityName = this.props.universityName;
    this.verdict = this.props.verdict;
    this.wordCount = this.props.wordCount;
    this.marks = this.props.marks;
    this.invoiceAmount = this.props.invoiceAmount;
    this.workCategory = this.props.workCategory;
    this.currency = this.props.currency;
    this.ticketType = this.props.ticketType;
    this.ticketID = this.props.ticketID;

    this.onUpdateTicketAttachments = this.onUpdateTicketAttachments.bind(this);
  }

  componentDidMount() {
    setupImages(this);
    setupLinks(this);

    this.props.socket.on(TICKETS_UI_ATTACHMENTS_UPDATE, this.onUpdateTicketAttachments);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.ticketId !== this.props.ticketId) this.ticketId = this.props.ticketId;
    if (prevProps.status !== this.props.status) this.status = this.props.status;
    if (prevProps.owner !== this.props.owner) this.owner = this.props.owner;
    if (prevProps.subject !== this.props.subject) this.subject = this.props.subject;
    if (prevProps.issue !== this.props.issue) this.issue = this.props.issue;
    if (prevProps.attachments !== this.props.attachments) this.attachments = this.props.attachments;
    if (prevProps.module !== this.props.module) this.module = this.props.module;
    if (prevProps.universityName !== this.props.universityName) this.universityName = this.props.universityName;
    if (prevProps.verdict !== this.props.verdict) this.verdict = this.props.verdict;
    if (prevProps.wordCount !== this.props.wordCount) this.wordCount = this.props.wordCount;
    if (prevProps.marks !== this.props.marks) this.marks = this.props.marks;
    if (prevProps.invoiceAmount !== this.props.invoiceAmount) this.invoiceAmount = this.props.invoiceAmount;
    if (prevProps.workCategory !== this.props.workCategory) this.workCategory = this.props.workCategory;
    if (prevProps.currency !== this.props.currency) this.currency = this.props.currency;
  }

  componentWillUnmount() {
    this.props.socket.off(TICKETS_UI_ATTACHMENTS_UPDATE, this.onUpdateTicketAttachments);
  }

  onUpdateTicketAttachments(data) {
    if (this.ticketId === data.ticket._id) {
      this.attachments = data.ticket.attachments;
    }
  }

  onAttachmentInputChange(e) {
    const formData = new FormData();
    const attachmentFile = e.target.files[0];
    formData.append('ticketId', this.ticketId);
    formData.append('attachment', attachmentFile);
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
    axios
      .post(`/tickets/uploadattachment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'CSRF-TOKEN': token,
        },
      })
      .then(() => {
        this.props.socket.emit(TICKETS_UI_ATTACHMENTS_UPDATE, { _id: this.ticketId });
        helpers.UI.showSnackbar('Attachment Successfully Uploaded');
      })
      .catch((error) => {
        Log.error(error);
        if (error.response) Log.error(error.response);
        helpers.UI.showSnackbar(error, true);
      });
  }

  removeAttachment(e, attachmentId) {
    axios
      .delete(`/api/v1/tickets/${this.ticketId}/attachments/remove/${attachmentId}`)
      .then(() => {
        this.props.socket.emit(TICKETS_UI_ATTACHMENTS_UPDATE, { _id: this.ticketId });
        helpers.UI.showSnackbar('Attachment Removed');
      })
      .catch((error) => {
        Log.error(error);
        if (error.response) Log.error(error.response);
        helpers.UI.showSnackbar(error, true);
      });
  }
  downloadAttachment(e, attachmentName) {
    axios
      .get(`/tickets/getattachment/${attachmentName}`)
      .then((response) => {
        // alert('Download Successfull to downloads folder.');
        helpers.UI.showSnackbar('Attachment Downloaded to downloads');
      })
      .catch((error) => {
        Log.error(error);
        if (error.response) Log.error(error.response);
        helpers.UI.showSnackbar(error, true);
      });
  }

  // getAttachmentUrl(e, attachmentName) {
  //   axios
  //     .get(`/tickets/getattachment/${attachmentName}`)
  //     .then((response) => {
  //       this.setState({ fileUrl: response.data.fileUrl });
  //       // console.log('URL ', this.state.fileUrl);
  //     })
  //     .catch((error) => {
  //       Log.error(error);
  //       if (error.response) Log.error(error.response);
  //     });
  // }

  // enablePreview(e, attachmentName) {
  //   this.getAttachmentUrl(e, attachmentName);

  //   this.setState({ showPreview: true });
  // }

  render() {
    return (
      <div className="initial-issue uk-clearfix">
        <Avatar image={this.owner.image} userId={this.owner._id} />
        {/* Issue */}
        <div className="issue-text">
          <h3 className="subject-text">{this.subject}</h3>
          {/* <a href={`mailto:${this.owner.email}`}>
            {this.owner.fullname} &lt;{this.owner.email}&gt;
          </a> */}
          <a>{this.owner._id}</a>
          <br />
          <time dateTime={helpers.formatDate(this.props.date, 'YYYY-MM-DD HH:mm')}>
            {helpers.formatDate(this.props.date, this.props.dateFormat)}
          </time>
          <br />
          {/* Attachments */}
          <ul className="attachments">
            {this.attachments &&
              this.attachments.map((attachment) => (
                <li key={attachment._id}>
                  <a
                    className="no-ajaxy"
                    rel="noopener noreferrer"
                    onClick={(e) => this.downloadAttachment(e, attachment.name)}
                  >
                    {attachment.name}
                  </a>
                  {this.status.get('isResolved') === false && (
                    <a
                      role="button"
                      className={'remove-attachment'}
                      onClick={(e) => this.removeAttachment(e, attachment._id)}
                    >
                      <i className="fa fa-remove" />
                    </a>
                  )}
                </li>
              ))}
          </ul>
          <div className="issue-body" ref={(r) => (this.issueBody = r)}>
            {ReactHtmlParser(this.issue)}
          </div>
        </div>
        {/* Permissions on Fragment for edit */}
        {this.status.get('isResolved') === false &&
          helpers.hasPermOverRole(this.props.owner.role, null, 'tickets:update', true) && (
            <Fragment>
              <div
                className={'edit-issue'}
                onClick={() => {
                  if (this.props.editorWindow)
                    this.props.editorWindow.openEditorWindow({
                      subject: this.subject,
                      text: this.issue,
                      module: this.module,
                      universityName: this.universityName,
                      verdict: this.verdict,
                      wordCount: this.wordCount,
                      marks: this.marks,
                      invoiceAmount: this.invoiceAmount,
                      workCategory: this.workCategory,
                      currency: this.currency,
                      ticketType: this.ticketType,
                      onPrimaryClick: (data) => {
                        this.props.socket.emit(TICKETS_ISSUE_SET, {
                          _id: this.ticketId,
                          value: data.text,
                          subject: data.subjectText,
                          module: data.module,
                          universityName: data.universityName,
                          verdict: data.verdict,
                          wordCount: data.wordCount,
                          marks: data.marks,
                          invoiceAmount: data.invoiceAmount,
                          workCategory: data.workCategory,
                          currency: data.currency,
                        });
                      },
                    });
                }}
              >
                <i className="material-icons">&#xE254;</i>
              </div>
              <form className="form nomargin" encType="multipart/form-data">
                <div className="add-attachment" onClick={(e) => this.attachmentInput.click()}>
                  <i className="material-icons">&#xE226;</i>
                </div>

                <input
                  ref={(r) => (this.attachmentInput = r)}
                  className="hide"
                  type="file"
                  onChange={(e) => this.onAttachmentInputChange(e)}
                />
              </form>
            </Fragment>
          )}
      </div>
    );
  }
}

IssuePartial.propTypes = {
  ticketId: PropTypes.string.isRequired,
  status: PropTypes.object.isRequired,
  owner: PropTypes.object.isRequired,
  subject: PropTypes.string.isRequired,
  issue: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  dateFormat: PropTypes.string.isRequired,
  attachments: PropTypes.array,
  editorWindow: PropTypes.object,
  socket: PropTypes.object.isRequired,
};

export default IssuePartial;
