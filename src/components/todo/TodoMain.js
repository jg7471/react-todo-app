import React from 'react';
import '../../scss/TodoMain.scss';
import TodoItem from './TodoItem';

const TodoMain = ({ todoList, remove, check }) => {
  //todoList 전달 받음
  return (
    <ul className="todo-list">
      {todoList.map((todo) => {
        return (
          <TodoItem key={todo.id} item={todo} remove={remove} check={check} />
        );
      })}
    </ul>
  );
};

export default TodoMain;
