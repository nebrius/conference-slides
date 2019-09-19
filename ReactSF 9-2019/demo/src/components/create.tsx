/*
Copyright (C) Bryan Hughes <bryan@nebri.us>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import * as React from 'react';

export interface ICreateTodoProps {}

export interface ICreateTodoDispatch {
  add: (label: string) => void;
}

interface ICreateTodoState {
  labelValue: string;
}

export class CreateTodo extends React.Component<ICreateTodoProps & ICreateTodoDispatch, ICreateTodoState> {

  public state = {
    labelValue: ''
  };

  public render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <h3>Add new entry:</h3>
        <div>
          <label>Todo Label:</label>
          <input type="text" value={this.state.labelValue} onChange={this.onLabelChanged}></input>
        </div>
        <div>
          <input type="submit" value="Add"></input>
        </div>
      </form>
    );
  }

  private onLabelChanged = (event: React.FormEvent<HTMLInputElement>) => {
    const labelValue = event.currentTarget.value;
    this.setState(() => {
      const newState: ICreateTodoState = { labelValue };
      return newState;
    });
  }

  private handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.props.add(this.state.labelValue);
    this.setState(() => {
      const newState: ICreateTodoState = { labelValue: '' };
      return newState;
    });
  }
}
