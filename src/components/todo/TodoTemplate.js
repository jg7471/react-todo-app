import React, { useEffect, useState } from 'react';
import TodoHeader from './TodoHeader';
import TodoMain from './TodoMain';
import TodoInput from './TodoInput';
import '../../scss/TodoTemplate.scss';

const TodoTemplate = () => {
  //백엔드 서버에 할 일 목록(json)을 요청(fetch)해서 받아와야 함.
  const API_BASE_URL = 'http://localhost:8181/api/todos';

  //todos 배열을 상태 관리 //useState 초기값
  const [todos, setTodos] = useState([]);

  //id값 시퀀스 함수(DB 연동시키면 필요없음) -> 주석처리
  // const makeNewId = () => {
  //   if (todos.length === 0) return 1;
  //   return todos[todos.length - 1].id + 1; //맨 마지막 할 일 객체의 id보다 하나 크게
  // };

  /*
  TodoInput에게 todoText를 받아오는 함수
  자식 컴포넌트가 부모 컴포넌트에게 데이터를 전달할 때는
  일반적인 props 사용이 불가능
  부모 컴포넌트에서 함수를 선언(매개변수 꼭 선언) -> props로 함수를 전달
  자식 컴포넌트에서 전달받은 함수를 호출하면서 매개값으로 데이터를 전달
  */

  const addTodo = (todoText) => {
    const newTodo = {
      title: todoText,
    };
    fetch(API_BASE_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newTodo),
    })
      .then((res) => {
        if (res.status === 200) return res.json();
        else {
          //status 코드에 따라 에러 처리를 다르게 진행하면 됨
          console.log('error occured!');
        }
      })
      .then((data) => {
        setTodos(data.todos);
      });
  };

  //할 일 삭제 처리 함수
  const removeTodo = (id) => {
    fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    })
      .then((res) => res.json())
      .then((data) => setTodos(data.todos))
      .catch((err) => {
        console.log('err: ', err);
        alert('잘못된 삭제 요청입니다~!');
      });

    //const removedTodos = todos.filter((todo) => todo.id !== id); //방법1
    //setTodos(removedTodos);
    //setTodos(todos.filter((todo) => todo.id !== id)); //방법2
  };

  //할 일 체크 처리 함수
  const checkTodo = (id, done) => {
    fetch(API_BASE_URL, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id,
        done: !done,
      }),
    })
      .then((res) => res.json())
      .then((json) => setTodos(json.todos));
  };

  //map 개수 유지, filter 유지x
  //체크가 안 된 할 일의 개수를 카운트 하기
  const countRestTodo = () => todos.filter((todo) => !todo.done).length;

  useEffect(() => {
    //페이지가 처음 렌더링 됨과 동시에 할 일 목록을 서버에 요청해서 뿌려주기
    fetch(API_BASE_URL) //요청 보내기
      .then((res) => res.json())
      .then((json) => {
        console.log(json);

        //fetch를 통해 받아온 데이터를 상태 변수에 할당
        setTodos(json.todos);
      });
  }, []); //[]배열 비우기

  return (
    <div className="TodoTemplate">
      <TodoHeader count={countRestTodo} />
      <TodoMain todoList={todos} remove={removeTodo} check={checkTodo} />
      {/* remove라는 이름으러 넘김 */}
      <TodoInput addTodo={addTodo} />
      {/* 자식에게 함수 보냄 */}
    </div>
  );
};

export default TodoTemplate;
