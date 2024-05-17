import {
  Link,
  Container,
  Grid,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import React, { useState } from 'react';
import { API_BASE_URL, USER } from '../../config/host-config';

const Join = () => {
  //상태 변수로 회원가입 입력값
  const [userValue, setUserValue] = useState({
    //사용자의 입력값 이곳에서 관리
    userName: '',
    password: '',
    email: '',
  });

  //검증 메세지에 대한 상태변수 관리
  //입력값과 메세지는 따로 상태 관리(메세지는 백엔드로 보내줄 필요 없음)
  //메세지 영역은 각 입력창마다 존재(이름, 이메일, 비밀번호...)하기 때문에 객체 형태로 한번에 관리
  const [message, setMessage] = useState({
    userName: '',
    password: '',
    passwordCheck: '',
    email: '',
  });

  //검증 완료 체크에 대한 상태변수 관리
  //각각의 입력창마다 유효성 검증 사태를 관리해야 하기 때문에 객체로 선언.
  //상태를 유지하려는 이유 -> 스타일, 마지막에 회원가입 버튼 누를 때 까지 검증 상태를 유지해야 하기 때문.
  const [correct, setCorrect] = useState({
    userName: false,
    password: false,
    passwordCheck: false,
    email: false,
  });

  //검증된 데이터를 각각의 상태변수에 저장해 주는 함수.
  const saveInputState = ({
    key, //key : email
    inputValue, //email value
    flag, //T/F
    msg, //
  }) => {
    //입력값 세팅
    setUserValue((oldVal) => {
      return { ...oldVal, [key]: inputValue }; //객체형태라(()로 고대로 못받음) -> snapshot
    });

    //메시지 세팅
    setMessage((oldMsg) => {
      //snapshot 방식 : 객체니까
      return { ...oldMsg, [key]: msg }; //key(userName) 변수의 값을 프로퍼티 키로 활용하는 중
    });

    //입력값 검증 상태 세팅
    setCorrect((oldCorrect) => {
      return { ...oldCorrect, [key]: flag };
    });
  };
  //이름 입력창 체인지 이벤트 핸들러
  const nameHandler = (e) => {
    const nameRegex = /^[가-힣]{2,5}$/; //시작과 끝 ㄱ-ㅎ, 2-5 글자수
    const inputValue = e.target.value;

    // 입력값 검증
    let msg; // 검증 메세지를 저장할 변수
    let flag = false; // 입력값 검증 여부 체크 변수

    if (!inputValue) {
      msg = '유저 이름은 필수입니다.';
    } else if (!nameRegex.test(inputValue)) {
      msg = '2~5글자 사이의 한글로 작성하세요!';
    } else {
      msg = '사용 가능한 이름입니다.';
      flag = true;
    }

    // saveInputState에게 이 핸들러에서 처리한 여러가지 값을 객체로 한번에 넘기기.
    saveInputState({
      key: 'userName',
      inputValue,
      msg,
      flag,
    });
  };

  //이메일 중복 체크 서버 통신 함수 : host-config.js 에서 값 가져옴
  const fetchDuplicateCheck = (email) => {
    let msg = '';
    let flag = false;

    fetch(`${API_BASE_URL}${USER}/check?email=${email}`)
      .then((res) => res.json())
      .then((result) => {
        console.log('result: ', result);
        if (result) {
          msg = '이메일이 중복되었습니다.';
        } else {
          msg = '사용 가능한 이메일 입니다.';
          flag = true;
        }

        //비동기는 실행순서 보장되지 않음~! : 동시다발적 수행
        // 중복 확인 후 상태값 변경.
        saveInputState({
          key: 'email',
          inputValue: email,
          msg,
          flag,
        });
      });
  };

  //이메일 입력창 체인지 이벤트 핸들러
  const emailHandler = (e) => {
    const inputValue = e.target.value;

    const emailRegex = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;

    let msg;
    let flag = false;

    if (!inputValue) {
      msg = '이메일은 필수값 입니다';
    } else if (!emailRegex.test(inputValue)) {
      msg = '이메일 형식이 올바르지 않습니다.';
    } else {
      //이메일 중복 체크 : fetch 필요
      fetchDuplicateCheck(inputValue);
    }

    //중복 확인 후에만 상태변경 하는 것이 아님
    //입력창이 비거나, 정규표현식 위반인 경우에도 상태는 변경 되어야 함
    saveInputState({
      key: 'email',
      inputValue,
      msg,
      flag,
    });
  };
  return (
    <Container component="main" maxWidth="xs" style={{ margin: '200px auto' }}>
      <form noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography component="h1" variant="h5">
              계정 생성
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <TextField
              autoComplete="fname"
              name="username"
              variant="outlined"
              required
              fullWidth
              id="username"
              label="유저 이름"
              autoFocus
              onChange={nameHandler}
            />
            <span
              style={correct.userName ? { color: 'green' } : { color: 'red' }}
            >
              {message.userName}
            </span>
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              id="email"
              label="이메일 주소"
              name="email"
              autoComplete="email"
              onChange={emailHandler}
            />
            <span style={correct.email ? { color: 'green' } : { color: 'red' }}>
              {message.email}
            </span>
          </Grid>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password"
              label="패스워드"
              type="password"
              id="password"
              autoComplete="current-password"
            />
            <span></span>
          </Grid>

          <Grid item xs={12}>
            <TextField
              variant="outlined"
              required
              fullWidth
              name="password-check"
              label="패스워드 확인"
              type="password"
              id="password-check"
              autoComplete="check-password"
            />
            <span id="check-span"></span>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              style={{ background: '#38d9a9' }}
            >
              계정 생성
            </Button>
          </Grid>
        </Grid>
        <Grid container justify="flex-end">
          <Grid item>
            <Link href="/login" variant="body2">
              이미 계정이 있습니까? 로그인 하세요.
            </Link>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default Join;
