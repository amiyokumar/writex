import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Modals
import NoticeAlertModal from './NoticeAlertModal';
import CreateTicketTypeModal from './CreateTicketTypeModal';
import DeleteTicketTypeModal from './DeleteTicketTypeModal';
import FilterTicketModal from './FilterTicketsModal';
import AddPriorityToTypeModal from './AddPriorityToTypeModal';
import CreatePriorityModal from './CreatePriorityModal';
import DeletePriorityModal from './DeletePriorityModal';
import CreateStatusModal from './CreateStatusModal';
import DeleteTicketStatusModal from './DeleteTicketStatusModal';
import CreateTagModal from './CreateTagModal';
import AddTagsModal from './AddTagsModal';
import CreateTicketModal from './CreateTicketModal';
import CreateChildTicketModal from './CreateChildTicketModal';
import CreateRoleModal from './CreateRoleModal';
import DeleteRoleModal from './DeleteRoleModal';
import ViewAllNotificationsModal from './ViewAllNotificationsModal';
import CreateAccountModal from './CreateAccountModal';
import EditAccountModal from './EditAccountModal';
import CreateGroupModal from './CreateGroupModal';
import EditGroupModal from './EditGroupModal';
import CreateTeamModal from './CreateTeamModal';
import EditTeamModal from './EditTeamModal';
import CreateDepartmentModal from './CreateDepartmentModal';
import EditDepartmentModal from './EditDepartmentModal';
import CreateNoticeModal from 'containers/Modals/CreateNoticeModal';
import EditNoticeModal from 'containers/Modals/EditNoticeModal';
import LinkWarningModal from 'containers/Modals/LinkWarningModal';
import PasswordPromptModal from 'containers/Modals/PasswordPromptModal';
import PrivacyPolicyModal from 'containers/Modals/PrivacyPolicyModal';

const MODAL_COMPONENTS = {
  NOTICE_ALERT: NoticeAlertModal,
  CREATE_TICKET: CreateTicketModal,
  CREATE_CHILD_TICKET: CreateChildTicketModal,
  CREATE_TICKET_TYPE: CreateTicketTypeModal,
  DELETE_TICKET_TYPE: DeleteTicketTypeModal,
  FILTER_TICKET: FilterTicketModal,
  ADD_PRIORITY_TO_TYPE: AddPriorityToTypeModal,
  CREATE_PRIORITY: CreatePriorityModal,
  DELETE_PRIORITY: DeletePriorityModal,
  CREATE_STATUS: CreateStatusModal,
  DELETE_STATUS: DeleteTicketStatusModal,
  CREATE_TAG: CreateTagModal,
  ADD_TAGS_MODAL: AddTagsModal,
  CREATE_ROLE: CreateRoleModal,
  DELETE_ROLE: DeleteRoleModal,
  VIEW_ALL_NOTIFICATIONS: ViewAllNotificationsModal,
  CREATE_ACCOUNT: CreateAccountModal,
  EDIT_ACCOUNT: EditAccountModal,
  CREATE_GROUP: CreateGroupModal,
  EDIT_GROUP: EditGroupModal,
  CREATE_TEAM: CreateTeamModal,
  EDIT_TEAM: EditTeamModal,
  CREATE_DEPARTMENT: CreateDepartmentModal,
  EDIT_DEPARTMENT: EditDepartmentModal,
  CREATE_NOTICE: CreateNoticeModal,
  EDIT_NOTICE: EditNoticeModal,
  LINK_WARNING: LinkWarningModal,
  PASSWORD_PROMPT: PasswordPromptModal,
  PRIVACY_POLICY: PrivacyPolicyModal,
};

const ModalRoot = ({ modalType, modalProps }) => {
  if (!modalType) {
    return <div id={'modal-wrap'} />;
  }

  const SpecificModal = MODAL_COMPONENTS[modalType];
  return <SpecificModal {...modalProps} />;
};

ModalRoot.propTypes = {
  modalType: PropTypes.string,
  modalProps: PropTypes.object,
};

export default connect((state) => state.modal)(ModalRoot);
