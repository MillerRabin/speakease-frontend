const gTaskEntities = [
    {
        type: 'task',
        name: {
            general: 'Cancel task',
            en: 'cancel',
            ru: 'отменить',
            ko: '취소'
        },
        words: {
            ru: 'отменить',
            en: 'cancel',
            ko: '취소'
        },
        parameters: [{
            general: 'Integer',
            ru: 'Номер задачи?',
            en: 'Task index?',
            ko: '인덱스 작업?',
            value: -2
        }],
        intentions: [{
            title: 'Cancel the task',
            input: 'TaskOperationInfo',
            output: 'TaskInfo'
        }],
        value: {
            operation: 'cancel'
        }
    }
];

function init(intentionStorage) {
    intentionStorage.createIntention({
        title: {
            en: 'Types and intentions for managing tasks',
            ru: 'Типы и Намерения для управления задачами',
            ko: '작업 관리를 위한 타입과 인텐션'
        },
        description: {
            ru: `<h2>Поддерживаемые команды</h2>
            <ul>
                <li>Отменить [номер задачи] по-умолчанию последняя</li>
            </ul>`,
            en: `<h2>Supported commands</h2>
            <ul>
                <li>Cancel [task index] last by default</li>
            </ul>`,
            ko: `<h2>지원하는 명령어</h2>
            <ul>
                <li>[작업 인텍스] 취소, 기본값은 마지막 작업입니다</li>
            </ul>`
        },
        input: 'None',
        output: 'EntitiesInfo',
        onData: async function onData(status, intention) {
            if (status == 'accepted')
                intention.send('data', this, gTaskEntities);
        }
    });
}

export default {
    init
}