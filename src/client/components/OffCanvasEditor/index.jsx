/*
   
 *  
 *  Copyright (c) 2014-2019 Trudesk, Inc. All rights reserved.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import SingleSelect from '../../components/SingleSelect';
import Grid from '../../components/Grid';
import GridItem from '../../components/Grid/GridItem';
import enums from '../../../settings/enums';

import EasyMDE from 'components/EasyMDE';

import $ from 'jquery';
import 'jquery_custom';
import helpers from 'lib/helpers';

@observer
class OffCanvasEditor extends React.Component {
  @observable mdeText = '';
  @observable subjectText = '';
  @observable showSubject = true;
  @observable onPrimaryClick = null;
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

    this.primaryClick = this.primaryClick.bind(this);
  }

  componentDidMount() {
    helpers.UI.inputs();
    $('.off-canvas-bottom').DivResizer({});
    this.showSubject = this.props.showSubject;
  }

  componentDidUpdate() {
    helpers.UI.reRenderInputs();
  }

  primaryClick() {
    const data = {
      subjectText: this.subjectText,
      text: this.mdeText,
      module: this.module,
      universityName: this.universityName,
      verdict: this.verdict,
      wordCount: this.wordCount,
      marks: this.marks,
      invoiceAmount: this.invoiceAmount,
      workCategory: this.workCategory,
      currency: this.currency,
    };

    if (this.onPrimaryClick) this.onPrimaryClick(data);

    this.closeEditorWindow();
  }

  openEditorWindow(data) {
    this.subjectText = data.subject || '';
    this.mdeText = data.text || '';
    this.editor.setEditorText(this.mdeText);
    this.module = data.module || '';
    this.universityName = data.universityName || '';
    this.verdict = data.verdict || '';
    this.wordCount = data.wordCount || '';
    this.marks = data.marks || '';
    this.invoiceAmount = data.invoiceAmount || '';
    this.workCategory = data.workCategory || '';
    this.currency = data.currency || '';
    this.showSubject = data.showSubject !== undefined ? data.showSubject : true;
    this.ticketType = data.ticketType || '';

    this.onPrimaryClick = data.onPrimaryClick || null;

    $(this.editorWindow).removeClass('closed').addClass('open');
  }

  closeEditorWindow(e) {
    if (e) e.preventDefault();

    $(this.editorWindow).removeClass('open').addClass('closed');
  }

  render() {
    const mappedVerdicts = enums.verdicts.map((verdict) => {
      return { text: verdict, value: verdict };
    });
    const mappedWorkCategories = enums.workCategory.map((workCategory) => {
      return { text: workCategory, value: workCategory };
    });
    const mappedCurrencies = enums.currencies.map((curr) => {
      return { text: curr, value: curr };
    });
    return (
      <div className="off-canvas-bottom closed" ref={(r) => (this.editorWindow = r)}>
        <div className="edit-window-wrapper">
          {this.showSubject && (
            <>
              <div className="edit-subject-wrap">
                <label htmlFor="edit-subject-input">Subject</label>
                <input
                  id="edit-subject-input"
                  className="md-input mb-10"
                  value={this.subjectText}
                  onChange={(e) => (this.subjectText = e.target.value)}
                />
              </div>
              <div className="edit-subject-wrap">
                <Grid>
                  <GridItem width={'1-2'}>
                    <label htmlFor="edit-module-input">Module</label>
                    <input
                      id="edit-module-input"
                      className="md-input mb-10"
                      value={this.module}
                      onChange={(e) => (this.module = e.target.value)}
                    />
                  </GridItem>
                  <GridItem width={'1-2'}>
                    <label htmlFor="edit-university-input">University</label>
                    <input
                      id="edit-university-input"
                      className="md-input mb-10"
                      value={this.universityName}
                      onChange={(e) => (this.universityName = e.target.value)}
                    />
                  </GridItem>
                </Grid>
              </div>
              <div className="edit-subject-wrap">
                <Grid>
                  <GridItem width={'1-4'}>
                    <SingleSelect
                      showTextbox={false}
                      items={mappedCurrencies}
                      width={'100%'}
                      defaultValue={this.currency}
                      onSelectChange={(e) => {
                        this.currency = e.target.value;
                      }}
                    />
                  </GridItem>
                  <GridItem width={'1-4'}>
                    <label htmlFor="edit-invoiceAmount-input">Invoice Amount</label>
                    <input
                      id="edit-invoiceAmount-input"
                      className="md-input mb-10"
                      value={this.invoiceAmount}
                      onChange={(e) => (this.invoiceAmount = e.target.value)}
                    />
                  </GridItem>
                  <GridItem width={'1-4'}>
                    <label htmlFor="edit-wordCount-input">Word Count</label>
                    <input
                      id="edit-wordCount-input"
                      className="md-input mb-10"
                      value={this.wordCount}
                      onChange={(e) => (this.wordCount = e.target.value)}
                    />
                  </GridItem>
                  <GridItem width={'1-4'}>
                    <label htmlFor="edit-marks-input">Marks</label>
                    <input
                      id="edit-marks-input"
                      className="md-input mb-10"
                      value={this.marks}
                      onChange={(e) => (this.marks = e.target.value)}
                    />
                  </GridItem>
                </Grid>
              </div>
              <div className="edit-subject-wrap">
                <Grid>
                  <GridItem width={'1-2'}>
                    <label htmlFor="edit-workCategory-input">Work Category</label>
                    <SingleSelect
                      showTextbox={false}
                      items={mappedWorkCategories}
                      width={'100%'}
                      defaultValue={this.workCategory}
                      onSelectChange={(e) => {
                        this.workCategory = e.target.value;
                      }}
                    />
                  </GridItem>
                  {this.ticketType === 'Sales' && (
                    <GridItem width={'1-2'}>
                      <label htmlFor="edit-verdict-input">Verdict</label>
                      <SingleSelect
                        showTextbox={false}
                        items={mappedVerdicts}
                        width={'100%'}
                        defaultValue={this.verdict}
                        onSelectChange={(e) => {
                          this.verdict = e.target.value;
                        }}
                      />
                    </GridItem>
                  )}
                </Grid>
              </div>
            </>
          )}
          <br></br>
          <div className="editor-container">
            <div className="editor">
              <div className="code-mirror-wrap">
                <EasyMDE
                  showStatusBar={false}
                  defaultValue={this.mdeText}
                  value={this.mdeText}
                  onChange={(val) => (this.mdeText = val)}
                  ref={(r) => (this.editor = r)}
                  allowImageUpload={this.props.allowUploads}
                  inlineImageUploadUrl={this.props.uploadURL}
                />
              </div>
            </div>
          </div>

          <div className="action-panel">
            <div className="left-buttons">
              <button className="save-btn uk-button uk-button-accent mr-5" onClick={this.primaryClick}>
                {this.props.primaryLabel}
              </button>
              <button className="uk-button uk-button-cancel" onClick={(e) => this.closeEditorWindow(e)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

OffCanvasEditor.propTypes = {
  showSubject: PropTypes.bool,
  primaryLabel: PropTypes.string.isRequired,
  onPrimaryClick: PropTypes.func,
  closeLabel: PropTypes.string,
  allowUploads: PropTypes.bool,
  uploadURL: PropTypes.string,
};

OffCanvasEditor.defaultProps = {
  showSubject: true,
  closeLabel: 'Cancel',
  allowUploads: false,
};

export default OffCanvasEditor;
