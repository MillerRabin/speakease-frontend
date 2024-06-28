import decision from './decision.js';

let iQuery = null;

function init(intentionStorage) {
    intentionStorage.createIntention({
        title: {
            en: 'Can translate raw user input to known entities and tasks',
            ru: 'Преобразую пользовательский ввод в известные сущности и задачи',
            ko: '유저 입력을 알려진 개체와 작업으로 변경'
        },
        input: 'Recognition',
        output: 'HTMLTextAreaElement',
        onData: async function (status, intention, value) {
            if (value != null)
                iQuery.accepted.send(value);
        }
    });

    iQuery = intentionStorage.createIntention({
        title: {
            en: 'I return known entities by raw user input',
            ru: 'Я возвращаю известные сущности из пользовательского ввода',
            ko: '유저 입력으로부터 인식된 개체를 반환'
        },
        input: 'Entities',
        output: 'Recognition',
        onData: async (status, intention, value) => {
            if (status == 'data') {
                decision.build(value);
            }
        }
    });

    decision.init(intentionStorage);
}

export default {
    init
}