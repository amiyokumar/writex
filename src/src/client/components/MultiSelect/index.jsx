import React from 'react';
import PropTypes from 'prop-types';
import { each } from 'lodash';

import $ from 'jquery';
import helpers from 'lib/helpers';

class MultiSelect extends React.Component {
  componentDidMount() {
    const $select = $(this.select);
    helpers.UI.multiSelect({
      afterSelect: this.props.onChange,
      afterDeselect: this.props.onChange,
    });

    if (this.props.initialSelected) {
      $select.multiSelect('select', this.props.initialSelected);
      $select.multiSelect('refresh');
    }

    if (this.props.disabled) {
      $select.attr('disabled', 'disabled');
      $select.multiSelect('refresh');
    }
  }

  componentDidUpdate(prevProps) {
    const $select = $(this.select);
    if (!helpers.arrayIsEqual(prevProps.items, this.props.items)) {
      $select.empty().multiSelect('refresh');
      each(this.props.items, (i) => {
        $select.append(`<option value='${i.value}'>${i.text}</option>`);
      });

      $select.attr('disabled', false);
      $select.multiSelect('refresh');

      if (this.props.initialSelected) {
        $select.multiSelect('select', this.props.initialSelected);
        $select.multiSelect('refresh');
      }
    } else {
      if (prevProps.initialSelected !== this.props.initialSelected) {
        $select.multiSelect('select', this.props.initialSelected);
        $select.multiSelect('refresh');
      }
    }

    $select.attr('disabled', this.props.disabled);
    $select.multiSelect('refresh');
  }

  getSelected() {
    const $select = $(this.select);
    if (!$select) return [];
    return $select.val();
  }

  selectAll() {
    const $select = $(this.select);
    if ($select) {
      if (this.props.items && this.props.items.length > 0) {
        $select.multiSelect('select_all');
        $select.multiSelect('refresh');
      }
    }
  }

  deselectAll() {
    const $select = $(this.select);
    if ($select) {
      if (this.props.items && this.props.items.length > 0) {
        $select.multiSelect('deselect_all');
        $select.multiSelect('refresh');
      }
    }
  }

  render() {
    const { id, items } = this.props;
    return (
      <select id={id} multiple={'multiple'} className={'multiselect'} ref={(r) => (this.select = r)}>
        {items &&
          items.map((item, i) => {
            return (
              <option key={i} value={item.value}>
                {item.text}
              </option>
            );
          })}
      </select>
    );
  }
}

MultiSelect.propTypes = {
  id: PropTypes.string,
  items: PropTypes.array.isRequired,
  initialSelected: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default MultiSelect;
