//reducer 기능만 담은 .js = 소문자로 생성

export const initialState = {
  userValue: {
    userName: '',
    password: '',
    email: '',
  },
  message: {
    userName: '',
    password: '',
    passwordCheck: '',
    email: '',
  },
  correct: {
    userName: false,
    password: false,
    passwordCheck: false,
    email: false,
  },
};

//회원 가입쪽에서 여러 상태값을 중앙 집중화 해서 처리할 리듀서 함수.
//state: 최신의 상태값이 전달.
//action.type: 어떠한 상태값을 변경하는지에 대한 값.
//action.key: 입력창이 어디인지
//action.value: 입력값이 무엇인지.

export const joinReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER_VALUE':
      return {
        ...state,
        userValue: {
          ...state.userValue, //최신상태
          [action.key]: action.value,
        },
      };

    case 'SET_MESSAGE':
      return {
        ...state,
        message: {
          ...state.message, //최신상태
          [action.key]: action.value,
        },
      };

    case 'SET_CORRECT':
      return {
        ...state,
        correct: {
          ...state.correct, //최신상태
          [action.key]: action.value,
        },
      };

    default:
      break;
  }
};
//stats 최신상태 useState
//action 어떤 action 인지 dispatch
