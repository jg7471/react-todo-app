import { Button, Container, Grid, TextField, Typography } from '@mui/material';
import React, { useContext } from 'react';
import { API_BASE_URL as BASE, USER } from '../../config/host-config';
import AuthContext from '../../uitls/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const REQUST_URL = BASE + USER + '/signin';

  const { onLogin } = useContext(AuthContext); //AuthContext에서 onLogin을 꺼낸다@@@

  const redirection = useNavigate(); //네비 선언

  //서버에 비동기 로그인 요청(AJAX 요청(JSON))
  const fetchLogin = async () => {
    const $email = document.getElementById('email');
    const $password = document.getElementById('password');

    //방법 2: then 안쓰는 방법 await 첨부 시 async가 붙는다!
    //함수 앞에 async(비동기 방식 키워드)를 붙이면 해당 함수는 프로미스 객체를 바로 리턴

    //await는 async로 선언된 함수에서만 사용이 가능
    //await는 프로미스 객체가 처리될 때까지 기다림
    //프로미스 객체의 반환값을 바로 활용할 수 있도록 도와줌
    //then()을 활용하는 것보다 가독성이 좋고, 쓰기도 좋다
    const res = await fetch(REQUST_URL, {
      //1. res 처리 될 때까지 대기
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        //JSON 변환 후 body 객체에 담기
        email: $email.value,
        password: $password.value,
      }),
    });

    if (res.status === 400) {
      const text = await res.text(); //await 기다려! 순서 보장(기다림)
      //2. res 실행 : (비동기 원래 순서 보장x)
      alert(text);
      return;
    }

    //서버에서 전달된 json을 디스트럭쳐링해서 변수에 저장
    const { token, userName, email, role } = await res.json();
    
    //context API를 사용하여 로그인 상태를 업데이트
    onLogin(token, userName, role);

    //홈으로 리다이렉트
    redirection('/');



    /* 방법 1
    fetch(REQUST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        //객체에 담기
        email: $email.value,
        password: $password.value,
      }),
    })
      .then((res) => res.json()) //json 데이터 타입
      .then((data) => {
        //변수명 상관없음
        console.log('로그인 성공', data);
      })
      .catch((err) => {
        console.log('로그인 실패', err);
      });
      */

    //이메일과 비밀번호를 직접 지목해서 얻어보세요.(getElementById로 직접 지목)
    //요청 방식 : POST / email, password라는 이름으로 JSON 전송하기
    //응답 데이터를 console.log로 확인하세요.
  };

  const loginHandler = (e) => {
    e.preventDefault();
    //입력값에 관련된 처리를 하고 싶다면 여기서 하면 됨(예제에서는 생략)

    // 서버에 로그인 요청 전송
    fetchLogin();
  };
  return (
    <Container component="main" maxWidth="xs" style={{ margin: '200px auto' }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography component="h1" variant="h5">
            로그인
          </Typography>
        </Grid>
      </Grid>

      <form noValidate onSubmit={loginHandler}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label="email address"
              name="email"
              autoComplete="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="on your password"
              type="password"
              id="password"
              autoComplete="current-password"
            />
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" fullWidth variant="contained" color="primary">
              로그인
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default Login;
