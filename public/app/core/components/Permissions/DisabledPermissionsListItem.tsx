import React, { Component } from 'react';
import DescriptionPicker from 'app/core/components/Picker/DescriptionPicker';
import { permissionOptions } from 'app/stores/PermissionsStore/PermissionsStore';

export interface Props {
  item: any;
}

export default class DisabledPermissionListItem extends Component<Props, any> {
  render() {
    const { item } = this.props;

    return (
      <tr className="gf-form-disabled">
        <td style={{ width: '1%' }}>
          <i style={{ width: '25px', height: '25px' }} className="gicon gicon-shield" />
        </td>
        <td style={{ width: '90%' }}>
          {item.name}
          <span className="filter-table__weak-italic"> (角色)</span>
        </td>
        <td />
        <td className="query-keyword">可以</td>
        <td>
          <div className="gf-form">
            <DescriptionPicker
              optionsWithDesc={permissionOptions}
              onSelected={() => {}}
              value={item.permission}
              disabled={true}
              className={'gf-form-input--form-dropdown-right'}
            />
          </div>
        </td>
        <td>
          <button className="btn btn-inverse btn-small">
            <i className="fa fa-lock" />
          </button>
        </td>
      </tr>
    );
  }
}
