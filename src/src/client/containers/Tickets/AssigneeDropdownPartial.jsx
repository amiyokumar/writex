/*
 *  Author  :    Nawed Anjum
 *  Updated :    25/07/2023 07:48 PM
 */

import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx'

import { TICKETS_ASSIGNEE_LOAD, TICKETS_ASSIGNEE_SET, TICKETS_ASSIGNEE_CLEAR, TICKETS_ASSIGNEE_TEAM_LOAD } from 'serverSocket/socketEventConsts'

import Avatar from 'components/Avatar/Avatar'
import PDropDown from 'components/PDropdown'

import helpers from 'lib/helpers'

@observer
class AssigneeDropdownPartial extends React.Component {
  @observable agents = []

  constructor (props) {
    super(props)
    makeObservable(this)

    this.onUpdateAssigneeList = this.onUpdateAssigneeList.bind(this)
    this.onUpdateTeamAssigneeList = this.onUpdateTeamAssigneeList.bind(this)
  }

  componentDidMount () {
    this.props.socket.on(TICKETS_ASSIGNEE_LOAD, this.onUpdateAssigneeList)
    this.props.socket.on(TICKETS_ASSIGNEE_TEAM_LOAD, this.onUpdateTeamAssigneeList)

  }

  componentWillUnmount () {
    this.props.socket.off(TICKETS_ASSIGNEE_LOAD, this.onUpdateAssigneeList)
    this.props.socket.off(TICKETS_ASSIGNEE_TEAM_LOAD, this.onUpdateTeamAssigneeList)

  }

  onUpdateAssigneeList (data) {
    this.agents = data || []
  }

  onUpdateTeamAssigneeList (data) {
    this.agents = data || []
  }

  render () {
    return (
      <PDropDown
        ref={this.props.forwardedRef}
        title={this.agents.length > 0 ? 'Select Assignee': 'Choose a team first to view the list'}
        id={'assigneeDropdown'}
        className={'opt-ignore-notice'}
        override={true}
        leftArrow={true}
        topOffset={75}
        leftOffset={35}
        minHeight={215}
        rightComponent={
          <a
            className={'hoverUnderline no-ajaxy'}
            onClick={() => {
              helpers.hideAllpDropDowns()
              if (this.props.onClearClick) this.props.onClearClick()
              this.props.socket.emit(TICKETS_ASSIGNEE_CLEAR, this.props.ticketId)
            }}
          >
            Clear Assignee
          </a>
        }
      >
        {this.agents.map(agent => {
          return (
            <li
              key={agent._id}
              onClick={() => {
                if (this.props.onAssigneeClick) this.props.onAssigneeClick({ agent })
                helpers.hideAllpDropDowns()
                this.props.socket.emit(TICKETS_ASSIGNEE_SET, { _id: agent._id, ticketId: this.props.ticketId })
              }}
            >
              <a className='messageNotification no-ajaxy' role='button'>
                <div className='uk-clearfix'>
                  <Avatar userId={agent._id} image={agent.image} size={50} />
                  <div className='messageAuthor'>
                    <strong>{agent.fullname}</strong>
                  </div>
                  <div className='messageSnippet'>
                    <span>{agent.email}</span>
                  </div>
                  <div className='messageDate'>{agent.title}</div>
                </div>
              </a>
            </li>
          )
        })}
      </PDropDown>
    )
  }
}

AssigneeDropdownPartial.propTypes = {
  ticketId: PropTypes.string.isRequired,
  onClearClick: PropTypes.func,
  onAssigneeClick: PropTypes.func,
  socket: PropTypes.object.isRequired,
  forwardedRef: PropTypes.any.isRequired
}

const mapStateToProps = state => ({
  socket: state.shared.socket
})

export default connect(mapStateToProps, {}, null, { forwardRef: true })(AssigneeDropdownPartial)
