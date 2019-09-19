## Create global types

**types.ts**

```typescript
import { Reducer } from 'redux';

export interface ITodo {
  label: string;
}

export interface IStore {
  todos: ITodo[];
}

export interface IReducers {
  todos: Reducer;
}
```

## Create base action interface and empty action type enum

**actions/actions.ts**

```typescript
export enum Action {

}

export interface IAction {
  type: Action;
}
```

## Create todoReducer

**reducers/reducers.ts**

```typescript
import { Reducer } from 'redux';
import { IStore } from '../types';
import { IAction } from '../actions/actions';

export const todoReducer: Reducer<IStore> = (state: IStore | undefined, action: IAction) => {
  if (!state) {
    state = {
      todos: []
    };
  }
  switch (action.type) {
    default:
      return state;
  }
};
```

## Instantiate store and reducers

**app.tsx**

```typescript
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { IReducers } from './types';
import { todoReducer } from './reducers/reducers';

const reducers: IReducers = {
  todos: todoReducer
};
const store = createStore(combineReducers(reducers));

ReactDOM.render(
  (
    <Provider store={store}>
    </Provider>
  ),
  document.getElementById('app')
);
```

## Create create component

**components/create.tsx**

```typescript
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
```

## Create Add Todo action

**actions/actions.ts**

```typescript
export enum Action {
  AddTodo
}

export interface IAction {
  type: Action;
}

// Add Todo

export interface IAddTodoAction extends IAction {
  type: Action.AddTodo;
  label: string;
}

export function createAddTodoAction(label: string): IAddTodoAction {
  return {
    type: Action.AddTodo,
    label
  };
}
```

## Create create container

**containers/create.ts**

```javascript
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
```

## Link in to Root component

**components/root.tsx**

```typescript
import * as React from 'react';
import { CreateContainer } from '../containers/create';

export function Root(): JSX.Element {
  return (
    <div>
      <CreateContainer />
    </div>
  );
}
```

## Update reducer

**reducers/reducers.ts**

```typescript
import { Reducer } from 'redux';
import { IStore } from '../types';
import { Action, IAction, IAddTodoAction } from '../actions/actions';

export const todoReducer: Reducer<IStore> = (state: IStore | undefined, action: IAction) => {
  if (!state) {
    state = {
      todos: []
    };
  }
  switch (action.type) {
    case Action.AddTodo:
      state.todos = [
        ...state.todos,
        { label: (action as IAddTodoAction).label }
      ];
      return state;
    default:
      return state;
  }
};
```
