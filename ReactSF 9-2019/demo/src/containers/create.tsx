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

import { connect } from 'react-redux';
import { IStore } from '../types';
import { IAction } from '../actions/actions';
import { CreateTodo, ICreateTodoProps, ICreateTodoDispatch } from '../components/create';
import { createAddTodoAction } from '../actions/actions';

function mapStateToProps(state: IStore): ICreateTodoProps {
  return {};
}

function mapDispatchToProps(dispatch: (action: IAction) => any): ICreateTodoDispatch {
  return {
    add: (label: string) => dispatch(createAddTodoAction(label))
  };
}

export const CreateContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateTodo);
