const basicTypes = [
  {
    type: 'type',
    name: {
      general: 'Name',
    },
    value: {
      name: 'speakease',
      system: 'all'
    },
    words: [
      { en: 'speakease' },
      { en: 'speakeasy' },
      { en: 'speak ease' },
      { en: 'speak easy' },
      { en: 'speak easier'},
      { ko: '스피크이지' },
      { ko: '스픽이지' },
      { ko: '아나운서 트월킹' },
      { ko: '스피키지' }, 
      { ko: '패키지' }, 
      { ko: 'spicy' },       
      { ko: '스피크이즈' },       
    ]
  }, {
    type: 'class',
    extends: 'integer',
    name: {
      general: 'int8',
      en: 'Eight bit integer',
      ru: 'Восьмибитное целое',
      ko: '팔 비트 정수'
    },
    lowerLimit: 0,
    upperLimit: 255
  }, {
    type: 'class',
    extends: 'integer',
    name: {
      general: 'int16',
      en: 'Sixteen bit integer',
      ru: 'Шестнадцатибитное целое',
      ko: '십육 비트 정수'
    },
    lowerLimit: 0,
    upperLimit: 65535
  }, {
    type: 'class',
    path: 'int16',
    name: {
      general: 'Amount',
      en: 'Amount',
      ru: 'Amount',
      ko: 'Amount'
    },
    lowerLimit: 0,
    upperLimit: 65535
  },{
    type: 'type',
    name: {
      general: 'PasswordRequest',
      en: 'PasswordRequest',
      ru: 'PasswordRequest',
      ko: 'PasswordRequest'
    },
    value: 'PasswordRequest',
    words: [
      { ru: 'пароль', en: 'password' },
    ]
  },
   {
    type: 'type',
    name: {
      general: 'ApproveRequest',
      en: 'ApproveRequest',
      ru: 'ApproveRequest',
      ko: 'ApproveRequest'
    },
    value: 'ApproveRequest',
    words: [
        { ru: 'подтвердить', en: 'approve', ko: '승인' },
        { ru: 'ок', en: 'okay', ko: '오케이' },
        { ru: 'подтверждаю', en: 'confirm', ko: '확인' },
        { en: 'the proof', ko: '그래' },
        { en: 'review', ko: '리뷰'},
        { en: 'if you send', ko: '어' },
        { ko: '응'},
        { ko: '네'},
        { ko: '예'}]
  }, {
    type: 'type',
    name: {
      general: 'CancelRequest',
      en: 'CancelRequest',
      ru: 'CancelRequest',
      ko: 'CancelRequest'
    },
    value: 'CancelRequest',
    words: [{ ru: 'отмена', en: 'cancel', ko: '취소' }, { ru: 'отменить', en: 'reject', ko: '거부' }, { ru: 'закрыть', en: 'close', ko: '닫기' }]
  }, {
    type: 'type',
    name: {
      general: 'CopyRequest',
      en: 'CopyRequest',
      ru: 'CopyRequest',
      ko: 'CopyRequest'
    },
    value: 'CopyRequest',
    words: [
      { ru: 'копировать', en: 'copy', ko: '복사' },
      { ru: 'скопировать' }, { en: 'coffee'},
      { en: 'copia'}
    ]
  }, {
    type: 'type',
    name: {
      general: 'YesRequest',
      en: 'YesRequest',
      ru: 'YesRequest',
      ko: 'YesRequest'
    },
    value: 'YesRequest',
    words: [{ ru: 'да', en: 'yes', ko: '예' }, { ru: 'подтвердить', en: 'confirm', ko: '확인' }, { en: 'approve', ko: '승인' }, { ko: '어' }, { ko: '응' }, { ko: '예' }]
  }, {
    type: 'type',
    name: {
      general: 'NoRequest',
      en: 'NoRequest',
      ru: 'NoRequest',
      ko: 'NoRequest'
    },
    value: 'NoRequest',
    words: [{ ru: 'нет', en: 'no', ko: '아니' }, { ko: '싫어'}, { ko: '아니요'}]
  }, {
    type: 'type',
    name: {
      general: 'ImportRequest',
      en: 'ImportRequest',
      ru: 'ImportRequest',
      ko: 'ImportRequest'
    },
    value: 'ImportRequest',
    words: [{ ru: 'импортировать', en: 'import', ko: '수입' }]
  }, {
    type: 'type',
    name: {
      general: 'GenerateRequest',
      en: 'GenerateRequest',
      ru: 'GenerateRequest',
      ko: 'GenerateRequest'
    },
    value: 'GenerateRequest',
    words: [
      { ru: 'сгенерировать', en: 'generate', ko: '생성' },
      { ru: 'создать', en: 'create', ko: '생성' }
    ]
  },
  {
    type: 'type',
    name: {
      general: 'AddRequest',
      en: 'AddRequest',
      ru: 'AddRequest',
      ko: 'AddRequest'
    },
    value: 'AddRequest',
    words: [
      { ru: 'добавить', en: 'add', ko: '추가'},
      { ru: 'новый', en: 'new', ko:'새로'},
      { ru: 'эд',en: 'ed'},
      { en: 'create'}
    ]
  }, {
    type: 'type',
    name: {
      general: 'DeleteRequest',
      en: 'DeleteRequest',
      ru: 'DeleteRequest',
      ko: 'DeleteRequest'
    },
    value: 'DeleteRequest',
    words: [
      { ru: 'удалить', en: 'delete', ko: '삭제'},
      { ru: 'убрать', en: 'clear', ko: '제거'},
      { en: 'remove' }
    ]
  }, {
    type: 'type',
    name: {
      general: 'RenameRequest',
      en: 'RenameRequest',
      ru: 'RenameRequest',
      ko: 'RenameRequest'
    },
    value: 'RenameRequest',
    words: [
      { ru: 'переименовать', en: 'rename', ko: '수정'},
      { en: 'real name'},
    ]
  }, {
    type: 'type',
    name: {
      general: 'EditRequest',
      en: 'EditRequest',
      ru: 'EditRequest',
      ko: 'EditRequest'
    },
    value: 'EditRequest',
    words: [{ ru: 'редактировать', en: 'edit', ko: '편집'}]
  }, {
    type: 'type',
    name: {
      general: 'ViewRequest',
      en: 'ViewRequest',
      ru: 'ViewRequest',
      ko: 'ViewRequest'
    },
    value: 'ViewRequest',
    words: [
      { ru: 'показать', en: 'view' },
      { ru: 'просмотр', en: 'show', ko: '보기' }
    ]
  },
  {
    type: 'type',
    name: {
      general: 'SendRequest',
      en: 'SendRequest',
      ru: 'SendRequest',
      ko: 'SendRequest'
    },
    value: 'SendRequest',
    words: [
      { ru: 'отправить', en: 'send', ko: '보내기' },
    ]
  },
  {
    type: 'type',
    name: {
      general: 'FromRequest',
    },
    value: 'FromRequest',
    words: [
      { ru: 'от', en: 'from'}
    ]
  }, {
    type: 'type',
    name: {
      general: 'ToRequest',
    },
    value: 'ToRequest',
    words: [{ ru: 'отправленные', en: 'to', ko: '에게' },
            { en: 'two' }
            ]
  }, {
    type: 'type',
    name: {
      general: 'BuyRequest',
    },
    value: 'spend',
    words: [{ ru: 'потратить', en: 'spend'}, { en: 'to spend'}]
  },
  {
    type: 'type',
    name: {
      general: 'AllRequest',
    },
    value: 'all',
    words: [{ ru: 'все', en: 'all', ko: '모두' }]
  },
  {
    type: 'type',
    name: {
      general: 'BuyRequest',
    },
    value: 'buy',
    words: [
      { ru: 'купить', en: 'buy', ko: 'buy' },
      { ru: 'купить', en: 'bye', ko: 'bye' }
    ]
  },
  {
    type: 'type',
    name: {
      general: 'BackRequest',
    },
    value: 'back',
    words: [
      { ru: 'назад', en: 'back', ko: 'back' },
      { ru: 'вернуться', en: 'go back', ko: 'go back' }
    ]
  }
];

function init(intentionStorage) {
  intentionStorage.createIntention({
    title: {
      en: 'Basic types intentions',
      ru: 'Базовые типы данных',
      ko: '기본 타입 인텐션',
    },
    description: {
      en: `<h2>Translates data types</h2>
            <ul>
                <li>int8</li>
                <li>int16</li>
                <li>SIDO: Currency</li>
                <li>KLAY: Currency</li>
            </ul>`,
      ru: `<h2>Транслирую типы данных</h2>
            <ul>
                <li>int8</li>
                <li>int16</li>
                <li>SIDO: Currency</li>
                <li>KLAY: Currency</li>
            </ul>`,
      ko: `<h2>데이터 타입 변환</h2>
            <ul>
                <li>int8</li>
                <li>int16</li>
                <li>SIDO: Currency</li>
                <li>KLAY: Currency</li>
            </ul>`
    },
    input: 'None',
    output: 'EntitiesInfo',
    onData: async function onData(status, intention) {
      if (status == 'accepted')
        intention.send('data', this, basicTypes);
    }
  });
}

export default {
  init
}
