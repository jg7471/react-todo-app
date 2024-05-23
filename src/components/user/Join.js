import {
  Link,
  Container,
  Grid,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import React, { useCallback, useReducer, useRef, useState } from 'react';
import { API_BASE_URL, USER } from '../../config/host-config';
import { initialState, joinReducer } from './joinReducer';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import '../../scss/Join.scss';

const Join = () => {
  //useRef를 사용해서 태그 참조하기
  const $fileTag = useRef();

  //리다이렉트 효과 사용하기 //location.href 사용x(꿈뻑 방지)
  const navigate = useNavigate();

  //useReducer를 사용해서 리듀서 함수 등록, state와 dispatch를 전달받음
  const [state, dispatch] = useReducer(joinReducer, initialState);

  //상태 객체에서 각각의 상태 객체값을 분해 할당
  const { userValue, message, correct } = state;

  // 각각의 핸들러에서 호출하는 dispatch 처리를 중앙화 하자.
  const updateState = (key, inputValue, msg, flag) => {
    key !== 'passwordCheck' && //@@
      dispatch({
        type: 'SET_USER_VALUE',
        key,
        value: inputValue,
      });
    dispatch({
      type: 'SET_MESSAGE',
      key,
      value: msg,
    });
    dispatch({
      type: 'SET_CORRECT',
      key,
      value: flag,
    });
  };

  //각각의 핸들러에 붙어 있는 디바운스 함수를 일괄적 처리
  //useCallback: 함수의 메모이제이션을 위한 훅. (함수의 선언을 기억했다가 재사용 하기 위한 훅)
  //상태값 변경에 의해 화면의 재렌더링이 발생할 때, 컴포넌트의 함수들도 재선언이 됨.
  //useCallback으로 함수를 감싸 주시면 이전에 생성된 함수를 기억했다가 재사용하도록 하기 때문에
  //불필요한 함수 선언을 방지할 수 있음(성능 최적화에 도움이 됨)
  const debouncedUpdateState = useCallback(
    debounce((key, inputValue, msg, flag) => {
      console.log('debounce called! key: ', key);
      updateState(key, inputValue, msg, flag);
    }, 500),
    [],
  ); //[] 의존성 배열을 비워놓으면, 첫 렌더링 때 함수가 선언되고 다시는 재선언되지 않음
  //만약 함수의 선언이 특정 상태가 변할 때 재선언 되어야 한다면, 의존성 배열에 상태 변수로 선언하면 됨

  // 이름 입력창 체인지 이벤트 핸들러
  const nameHandler = (e) => {
    console.log('nameHandler가 동작함!');
    const inputValue = e.target.value;
    const nameRegex = /^[가-힣]{2,5}$/;

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

    debouncedUpdateState('userName', inputValue, msg, flag);
  };

  //debounce함수(lodash 라이브러리) : 콜백방식으로 받음 : 0.5초 후 실행 cleanUp과 동일

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

        debouncedUpdateState('email', email, msg, flag);
      });
  };
  //비동기는 실행순서 보장되지 않음~! : 동시다발적 수행
  // 중복 확인 후 상태값 변경.

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
      return; //종료 -> debouncedUpdatestate
    }

    debouncedUpdateState('email', inputValue, msg, flag); //문제 없을 시 상태값 업데이트
  };

  //패스워드 입력창 체인지 이벤트 핸들러
  const passwordHandler = (e) => {
    const inputValue = e.target.value;
    //패스워드가 변경됐다? -> 패스워드 확인란도 초기화 시킨다.
    document.getElementById('password-check').value = '';

    updateState('passwordCheck', '', '', false);

    const pwRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,20}$/;

    let msg;
    let flag = false;

    if (!inputValue) {
      msg = '비밀번호는 필수입니다.';
    } else if (!pwRegex.test(inputValue)) {
      msg = '8글자 이상의 영문, 숫자, 특수문자를 포함해 주세요.';
    } else {
      msg = '사용 가능한 비밀번호 입니다.';
      flag = true;
    }

    debouncedUpdateState('password', inputValue, msg, flag);
  };

  // 비밀번호 확인란 체인지 이벤트 핸들러
  const pwCheckHandler = (e) => {
    const inputValue = e.target.value;

    let msg;
    let flag = false;
    if (!inputValue) {
      msg = '비밀번호 확인란은 필수입니다.';
    } else if (userValue.password !== inputValue) {
      msg = '비밀번호가 일치하지 않습니다.';
    } else {
      msg = '비밀번호가 일치합니다.';
      flag = true;
    }

    debouncedUpdateState('passwordCheck', 'pass', msg, flag);
    //pass 아무값
  };

  //4개의 입력창이 모두 검증에 통과 했는지 여부를 검사
  const isValid = () => {
    for (let key in correct) {
      //correct 객체라 for문 : 배열고차 함수 x
      const flag = correct[key];
      if (!flag) return false;
    }
    return true;
  };

  //회원 가입 처리 서버 요청
  const fetchSignUpPost = async () => {
    /*
      기존 회원가입은 단순히 텍스트를 객체로 모은 후 JSON으로 변환해서 요청 보내주면 끝.
      이제는 프로필 이미지가 추가됨. -> 파일 첨부 요청은 multipart/form-data로 전송해야 함.
      FormData 객체를 활용해서 Content-type을 multipart/form-data로 지정한 후 전송하려 함.
      그럼 JSON 데이터는? Content-type이 application/json이다. 
      Content-type이 서로 다른 데이터를 한번에 FormData에 감싸서 보내면 
      415(unsupported Media Type) 에러가 발생함.
      그렇다면 -> JSON을 Blob으로 바꿔서 함께 보내자. 
      Blob은 이미지, 사운드, 비디오 같은 멀티미디어 파일을 바이트 단위로 쪼개어 파일 손상을 방지하게 
      해 주는 타입. -> multipart/form-data에도 허용됨.
    */

    //JSON을 Blob 타입으로 변경
    const userJsonBlob = new Blob([JSON.stringify(userValue)], {
      type: 'application/json',
    }); //객체 생성 : 1번째 배열[]로 받음 , 2번째 타입 @@@

    //이미지 파일과 회원정보 JSON을 하나로 묶어서 보낼 예정.
    //FormData 객체를 활용해서.
    const userFormData = new FormData(); //객체 생성
    userFormData.append('user', userJsonBlob); //input name
    userFormData.append('profilelImage', $fileTag.current.files[0]); //[0] 사용자가 첨부한 이미지

    const res = await fetch(API_BASE_URL + USER, {
      method: 'POST',
      body: userFormData,
    });

    if (res.status === 200) {
      const data = await res.json;
      alert(`${data.userName}(${data.email}님 회원가입에 성공했습니다.`);
      //로그인 페이지 리다이렉트
      navigate('/login');
    } else {
      alert('서버와의 통신이 원할하지 않습니다.');
    }
  };

  //회원가입 버튼 클릭 이벤트 핸들러
  const joinButtonClickHandler = (e) => {
    e.preventDefault();

    if (isValid()) {
      //fetch를 사용한 회원 가입 요청.
      fetchSignUpPost();
    } else {
      alert('입력란을 다시 확인해 주세요');
    }
  };

  //이미지 파일 상태 변수
  const [imgFile, setImgFile] = useState(null);

  //이미지 파일을 선택했을 때 썸네일을 뿌리는 핸들러
  const showThumbnailHandler = (e) => {
    //첨부된 파일 정보
    const file = $fileTag.current.files[0]; //첫번째

    //첨부한 파일 이름을 얻은 후 확장자만 추출. (소문자만 일괄 변경)
    const fileExt = file.name.slice(file.name.indexOf('.') + 1).toLowerCase();
    if (
      fileExt !== 'jpg' &&
      fileExt !== 'png' &&
      fileExt !== 'jpeg' &&
      fileExt !== 'gif'
    ) {
      alert('이미지 파일만 주세요(jpg, png, jpeg, gif만 등록 가능합니다.');
      //형식에 맞지 않는 파일을 첨부한 것이 파악됐다면, input의 상태도 원래대로 돌려놓아야 한다.
      //그렇지 않으면 잘못된 파일을 input 태그가 여전히 기억하게 됨 -> 서버 요청시 에러 유발!
      $fileTag.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setImgFile(reader.result);
    };
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
            <div
              className="thumbnail-box"
              onClick={() => $fileTag.current.click()} //클릭효과 2
            >
              <img
                src={imgFile || require('../../assets/img/image-add.png')}
                // || 연산자는 첫 번째 피연산자가 "truthy" 값이면 그 값을 반환하고, 그렇지 않으면 두 번째 피연산자를 반환
                alt="profile"
              />
            </div>
            <label className="signup-img-label" htmlFor="profile-img">
              프로필 이미지 추가
            </label>
            <input //숨겨짐 1 useRef로 기억시킴
              id="profile-img"
              type="file"
              style={{ display: 'none' }}
              accept="image/*"
              ref={$fileTag}
              onChange={showThumbnailHandler}
            />
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
              onChange={passwordHandler}
            />
            <span
              style={correct.password ? { color: 'green' } : { color: 'red' }}
            >
              {message.password}
            </span>
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
              onChange={pwCheckHandler}
            />
            <span
              id="check-span"
              style={
                correct.passwordCheck ? { color: 'green' } : { color: 'red' }
              }
            >
              {message.passwordCheck}
            </span>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              style={{ background: '#38d9a9' }}
              onClick={joinButtonClickHandler}
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
