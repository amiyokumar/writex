import React from 'react';
import PropTypes from 'prop-types';
import DropdownTrigger from 'components/Dropdown/DropdownTrigger';
import Dropdown from 'components/Dropdown';
import SpinLoader from 'components/SpinLoader';
import clsx from 'clsx';

class TruCard extends React.Component {
  render() {
    return (
      <div
        className={clsx(
          'tru-card-wrapper',
          'uk-position-relative',
          this.props.fullSize && 'uk-width-1-1 uk-height-1-1'
        )}
        style={this.props.style}
      >
        <SpinLoader
          animate={this.props.animateLoader}
          animateDelay={this.props.animateDelay}
          active={this.props.loaderActive}
        />
        <div
          className={clsx(
            'tru-card',
            this.props.hover && 'tru-card-hover',
            this.props.fullSize && 'uk-width-1-1 uk-height-1-1'
          )}
        >
          {this.props.showMoveHandle && (
            <div style={{ cursor: 'move', position: 'absolute', top: 2, right: 8 }}>
              <i className="material-icons">drag_handle</i>
            </div>
          )}
          {this.props.header && (
            <div className={'tru-card-head ' + (this.props.extraHeadClass || '')}>
              {this.props.menu && (
                <div className={'tru-card-head-menu'}>
                  <DropdownTrigger pos={'bottom-right'} mode={'click'}>
                    <i className="material-icons tru-icon">more_vert</i>
                    <Dropdown small={true}>
                      {this.props.menu.map((child) => {
                        return child;
                      })}
                    </Dropdown>
                  </DropdownTrigger>
                </div>
              )}
              {/* HEADER TEXT */}
              {this.props.header && <div className={'uk-text-center'}>{this.props.header}</div>}
            </div>
          )}
          {/* Tru Card Content */}
          <div className={'tru-card-content uk-clearfix ' + (this.props.extraContentClass || '')}>
            {this.props.content}
          </div>
        </div>
      </div>
    );
  }
}

TruCard.propTypes = {
  menu: PropTypes.arrayOf(PropTypes.element),
  header: PropTypes.element,
  extraHeadClass: PropTypes.string,
  extraContentClass: PropTypes.string,
  content: PropTypes.element.isRequired,
  loaderActive: PropTypes.bool,
  hover: PropTypes.bool,
  fullSize: PropTypes.bool,
  showMoveHandle: PropTypes.bool,
  style: PropTypes.object,
  animateLoader: PropTypes.bool,
  animateDelay: PropTypes.number,
};

TruCard.defaultProps = {
  loaderActive: false,
  hover: true,
  fullSize: true,
  showMoveHandle: false,
  animateLoader: false,
  animateDelay: 600,
};

export default TruCard;
