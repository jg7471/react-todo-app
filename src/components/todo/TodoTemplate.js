import React, { useState, useEffect, useContext } from 'react';
import TodoHeader from './TodoHeader';
import TodoMain from './TodoMain';
import TodoInput from './TodoInput';
import '../../scss/TodoTemplate.scss';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'reactstrap';
import { API_BASE_URL as BASE, TODO, USER } from '../../config/host-config'; //가져오기
import axiosInstance from '../../config/axios-config';
import handleRequest from '../user/handleRequest';
import AuthContext from '../../utils/AuthContext';

const TodoTemplate = () => {
  const redirection = useNavigate();
  const { onLogout } = useContext(AuthContext);

  //백엔드 서버에 할 일 목록(json)을 요청(fetch)해서 받아와야 함.
  //const API_BASE_URL = API_BASE_URL //import 함
  const API_BASE_URL = BASE + TODO;
  const API_USER_URL = BASE + USER;

  //todos 배열을 상태 관리 //useState 초기값
  const [todos, setTodos] = useState([]);

  //로딩 상태값 관리(처음에는 로딩이 무조건 필요하기 때문에 true -> 로딩 끝나면 false로 전환)
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  /*
  //로그인 인증 토큰 얻어오기 //axios가 처리
  const [token, setToken] = useState(localStorage.getItem('ACCESS_TOKEN'));



  //fetch 요청을 보낼 때 사용할 요청 헤더 설정 //axios가 처리
  const requestHeader = {
    'content-type': 'application/json',
    //JWT에 대한 인증 토큰이라는 타입을 선언.
    Authorization: 'Bearer ' + token, //Bearer(' '공백 주의, 타입, 규약) + 토큰값
  };
  */

  /*
  TodoInput에게 todoText를 받아오는 함수
  자식 컴포넌트가 부모 컴포넌트에게 데이터를 전달할 때는
  일반적인 props 사용이 불가능
  부모 컴포넌트에서 함수를 선언(매개변수 꼭 선언) -> props로 함수를 전달
  자식 컴포넌트에서 전달받은 함수를 호출하면서 매개값으로 데이터를 전달
  */

  // 할 일 추가 함수
  const addTodo = async (todoText) => {
    const newTodo = {
      title: todoText,
    };
    handleRequest(
      //일괄처리(try/catch 사용x)
      () => axiosInstance.post(API_BASE_URL, newTodo), //requestFunc
      (data) => setTodos(data.todos), //onSuccess
      (error) => {
        //onError (리프레시 토큰도 이상있는 상태)
        if (error.response && error.response === 401) {
          alert('로그인 시간이 만료되었습니다. 다시 로그인 해 주세요.');
          onLogout();
          redirection('/login');
        }
      },
    );
  };

  //할 일 삭제 처리 함수
  const removeTodo = async (id) => {
    handleRequest(
      //일괄처리(try/catch 사용x)
      () => axiosInstance.delete(`${API_BASE_URL}/${id}`), //requestFunc
      (data) => setTodos(data.todos), //onSuccess
      onLogout,
      redirection,
    );
  };

  //할 일 체크 처리 함수
  const checkTodo = (id, done) => {
    handleRequest(
      //일괄처리(try/catch 사용x)
      () => axiosInstance.patch(API_BASE_URL, { id, done: !done }), //requestFunc
      (data) => setTodos(data.todos), //onSuccess
      onLogout,
      redirection,
    );
  };

  //map 개수 유지, filter 유지x
  //체크가 안 된 할 일의 개수를 카운트 하기
  const countRestTodo = () => todos.filter((todo) => !todo.done).length;

  // 비동기 방식 등급 승격 함수
  const fetchPromote = async () => {
    handleRequest(
      () => axiosInstance.put(`${API_USER_URL}/promote`),
      (data) => {
        localStorage.setItem('ACCESS_TOKEN', data.token);
        localStorage.setItem('USER_ROLE', data.role);
        setToken(data.token);
      },
      onLogout,
      redirection,
    );
  };

  useEffect(() => {
    // 페이지가 처음 렌더링 됨과 동시에 할 일 목록을 서버에 요청해서 뿌려 주겠습니다.
    handleRequest(
      () => axiosInstance.get(API_BASE_URL),
      (data) => {
        setTodos(data.todos);
        setLoading(false);
      },
      onLogout,
      redirection,
    );
  }, []);

  // 로딩이 끝난 후 보여줄 컴포넌트
  const loadEndedPage = (
    <div className="TodoTemplate">
      <TodoHeader count={countRestTodo} promote={fetchPromote} />
      <TodoMain todoList={todos} remove={removeTodo} check={checkTodo} />
      <TodoInput addTodo={addTodo} />
    </div>
  );

  // 로딩 중일 때 보여줄 컴포넌트
  const loadingPage = (
    <div className="loading">
      <Spinner color="danger">loading...</Spinner>
    </div>
  );

  return <>{loading ? loadingPage : loadEndedPage}</>;
};

export default TodoTemplate;
