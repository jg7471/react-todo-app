import React, { useState, useEffect } from 'react';
import TodoHeader from './TodoHeader';
import TodoMain from './TodoMain';
import TodoInput from './TodoInput';
import '../../scss/TodoTemplate.scss';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import { API_BASE_URL as BASE, TODO, USER } from '../../config/host-config'; //가져오기

const TodoTemplate = () => {
  const redirection = useNavigate();

  //백엔드 서버에 할 일 목록(json)을 요청(fetch)해서 받아와야 함.
  //const API_BASE_URL = API_BASE_URL //import 함
  const API_BASE_URL = BASE + TODO;
  const API_USER_URL = BASE + USER;

  //todos 배열을 상태 관리 //useState 초기값
  const [todos, setTodos] = useState([]);

  //로딩 상태값 관리(처음에는 로딩이 무조건 필요하기 때문에 true -> 로딩 끝나면 false로 전환)
  const [loading, setLoading] = useState(true);

  //로그인 인증 토큰 얻어오기
  const [token, setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));

  //fetch 요청을 보낼 때 사용할 요청 헤더 설정
  const requestHeader = {
    'content-type': 'application/json',
    //JWT에 대한 인증 토큰이라는 타입을 선언.
    Authorization: 'Bearer ' + token, //Bearer(' '공백 주의, 타입, 규약) + 토큰값
  };

  /*
  TodoInput에게 todoText를 받아오는 함수
  자식 컴포넌트가 부모 컴포넌트에게 데이터를 전달할 때는
  일반적인 props 사용이 불가능
  부모 컴포넌트에서 함수를 선언(매개변수 꼭 선언) -> props로 함수를 전달
  자식 컴포넌트에서 전달받은 함수를 호출하면서 매개값으로 데이터를 전달
  */

  const addTodo = async (todoText) => {
    const newTodo = {
      title: todoText,
    };

    const res = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: requestHeader,
      //headers: { 'content-type': 'application/json' },
      body: JSON.stringify(newTodo),
    });

    if (res.status === 200) {
      const json = await res.json();
      setTodos(json.todos); //배열에 넣기
    } else if (res.status === 401) {
      const message = await res.text();
      alert(message);
      redirection('/');
    } else if (res.status === 403) {
      const text = await res.text();
      alert(text);
    }
  };
  /*
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
  */

  //할 일 삭제 처리 함수
  const removeTodo = (id) => {
    fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: requestHeader, //헤더 정보
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
      headers: requestHeader, //토큰
      //headers: { 'content-type': 'application/json' },
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

  //비동기 방식 등급 승격 함수
  const fetchPromote = async () => {
    const res = await fetch(API_USER_URL + '/promote', {
      method: 'PUT',
      headers: requestHeader,
    });
    if (res.status === 400) {
      alert('이미 프리미엄 회원입니다.');
    } else if (res.status === 200) {
      const json = await res.json();
      localStorage.setItem('ACCESS_TOKEN', json.token);
      localStorage.setItem('USER_ROLE', json.role);
      setToken(json.token);
    }
  };

  useEffect(() => {
    //페이지가 처음 렌더링 됨과 동시에 할 일 목록을 서버에 요청해서 뿌려주기
    fetch(API_BASE_URL, {
      method: 'GET',
      headers: requestHeader,
    }) //요청 보내기
      .then((res) => {
        if (res.status === 200) return res.json();
        else if (res.status === 403) {
          alert('로그인이 필요한 서비스 입니다.');
          redirection('/login');
        } else {
          alert('관리자에게 문의하세요');
        }
      })
      .then((json) => {
        console.log(json);

        //fetch를 통해 받아온 데이터를 상태 변수에 할당
        if (json) setTodos(json.todos); //json 데이터가 존재하면(true) setTodos해라

        //로딩완료처리
        setLoading(false);
      });
  }, []); //[]배열 비우기

  //로딩이 끝난 후에 보여줄 컴포넌트
  const loadEndedPage = (
    <div className="TodoTemplate">
      <TodoHeader count={countRestTodo} promote={fetchPromote} />
      <TodoMain todoList={todos} remove={removeTodo} check={checkTodo} />
      {/* remove라는 이름으러 넘김 */}
      <TodoInput addTodo={addTodo} />
      {/* 자식에게 함수 보냄 */}
    </div>
  );

  //로딩 중일 때 보여줄 컴포넌트
  const loadingPage = (
    <div className="loading">
      <Spinner color="danger">loading...</Spinner>
      {/* Spinner 뱅글뱅글 도는 feat.리액트 제공 */}
    </div>
  );

  return <>{loading ? loadingPage : loadEndedPage}</>;
};

export default TodoTemplate;
