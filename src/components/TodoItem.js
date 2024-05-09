import React from 'react';
import '../scss/TodoItem.scss';
import { MdDelete, MdDone } from 'react-icons/md';
import cn from 'classnames';

const TodoItem = ({ item, remove, check }) => {
  const { id, title, done } = item; //디스트럭처링(중복)

  return (
    <li className="todo-list-item">
      <div
        className={cn('check-circle', { active: done })} //done T active 添
        onClick={() => check(id)}
      >
        {/* //item.id 디스트럭처링 효과 */}
        <MdDone />
      </div>
      <span className={cn('text', { finish: done })}>{title}</span>
      <div className="remove" onClick={() => remove(id)}>
        {/* remove 즉석함수 : 익명함수 */}
        <MdDelete />
      </div>
    </li>
  );
};

export default TodoItem;
