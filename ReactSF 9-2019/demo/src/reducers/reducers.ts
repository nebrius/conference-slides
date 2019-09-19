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

import { Reducer } from 'redux';
import { ITodo } from '../types';
import { Action, IAction, IAddTodoAction } from '../actions/actions';

export interface ITodoStore {
  list: ITodo[];
}

export const todoReducer: Reducer<ITodoStore> = (state: ITodoStore | undefined, action: IAction) => {
  if (!state) {
    state = {
      list: []
    };
  }
  switch (action.type) {
    case Action.AddTodo:
      return {
        ...state,
        list: [
          ...state.list,
          { label: (action as IAddTodoAction).label }
        ]
      };
    default:
      return state;
  }
};
