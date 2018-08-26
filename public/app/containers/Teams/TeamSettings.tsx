import React from 'react';
import { hot } from 'react-hot-loader';
import { observer } from 'mobx-react';
import { Team } from 'app/stores/TeamsStore/TeamsStore';
import { Label } from 'app/core/components/Forms/Forms';

interface Props {
  team: Team;
}

@observer
export class TeamSettings extends React.Component<Props, any> {
  constructor(props) {
    super(props);
  }

  onChangeName = evt => {
    this.props.team.setName(evt.target.value);
  };

  onChangeEmail = evt => {
    this.props.team.setEmail(evt.target.value);
  };

  onUpdate = evt => {
    evt.preventDefault();
    this.props.team.update();
  };

  render() {
    return (
      <div>
        <h3 className="page-sub-heading">团队设置</h3>
        <form name="teamDetailsForm" className="gf-form-group">
          <div className="gf-form max-width-30">
            <Label>名字</Label>
            <input
              type="text"
              required
              value={this.props.team.name}
              className="gf-form-input max-width-22"
              onChange={this.onChangeName}
            />
          </div>
          <div className="gf-form max-width-30">
            <Label tooltip="这是可选项，主要用于设置团队主页图标(统一标识服务)">
              邮箱
            </Label>
            <input
              type="email"
              className="gf-form-input max-width-22"
              value={this.props.team.email}
              placeholder="team@email.com"
              onChange={this.onChangeEmail}
            />
          </div>

          <div className="gf-form-button-row">
            <button type="submit" className="btn btn-success" onClick={this.onUpdate}>
              更新
            </button>
          </div>
        </form>
      </div>
    );
  }
}

export default hot(module)(TeamSettings);
