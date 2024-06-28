function createStructure(structure) {
    const s = Object.assign({}, structure);
    const path = s.path.split(' ');
    const eLength = path.length - 1;
    s.startIndex = s.wordIndex - eLength;
    s.endIndex = s.wordIndex + 1;
    return s;
}

function createKey(variant) {
    const key = [];
    for (const struct of variant.data)
        key.push(struct.startIndex, struct.endIndex, struct.name.general);    
    return key.join(' ');
}



function include(variant, struct) {
    function wrongValue(type) {
        throw new Error(`Wrong value type ${type}`);
    }

    /*const tStart = struct.startIndex;
    const tEnd = struct.endIndex;
    for (let s of variant.data) {
        const sStart = s.startIndex;
        const sEnd = s.endIndex;
        if ((tStart >= sStart) && (tStart < sEnd)) return false;
        if ((tEnd > sStart) && (tEnd < sEnd)) return false;
    }*/
    variant.data.push(struct);
    const sv = typeof(struct.value);
    const level = (sv == 'string') ? struct.value.split(' ').length :
                  (sv == 'object') ? 1 :
                  wrongValue(sv);

    variant.level = (variant.level < level) ? level : variant.level;
}


function createVariant(structures, index) {
    const variant = { level: 0, data: [] };
    const cStruct = structures[index];
    include(variant, cStruct);
    for (let i = 0; i < structures.length; i++) {
        if (i == index) continue;
        const tStruct = structures[i];
        include(variant, tStruct);
    }
    variant.data.sort((a, b) => a.startIndex - b.startIndex);
    variant.key = createKey(variant);
    return variant;
}


function buildStructureVariants(structData) {
    const variants = {};
    const structures = structData.allStructures;
    if (structures.length == 0) return;
    for (let i = 0; i < structures.length; i++) {
        const vr = createVariant(structures, i);
        variants[vr.key] = vr;
    }
    const vals = Object.values(variants);
    vals.sort((a, b) => b.level - a.level);
    structData.variants = vals;
}


function buildStructures(values) {
    const ival = { task: [], allStructures: [], currentTask: null, variants: [] };
    for (let val of values) {
        const structures = val.data;
        structures.reduce((acc, s) => {
            if (s == null) return acc;
            if (s.type == 'task') {
                acc.task.push(s);
                acc.currentTask = (acc.currentTask == null) || (s.level > acc.currentTask.level) ? s : acc.currentTask;
                return acc;
            }
            acc.allStructures.push(createStructure(s));
            return acc;
        }, ival);
    }
    buildStructureVariants(ival);
    return ival;
}


function detectStructure(structures) {
    const ps = buildStructures(structures);
    if (ps.currentTask == null) {
        if (ps.variants.length > 0)
            iTask.accepted.send({
                structures: ps.variants[0].data
            });
        return;
    }

    const variants = (ps.variants.length > 0) ? ps.variants[0].data : [];

    iTask.accepted.send({
        task: ps.currentTask,
        structures: variants
    });
}

function build(structures) {
    return detectStructure([...structures.values()]);
}

let iTask = null;
function init(intentionStorage) {
    iTask = intentionStorage.createIntention({
        title: {
            en: 'Execute tasks',
            ru: 'Отправляю задачи на выполнение',
            ko: '작업 실행'
        },
        input: 'TaskOperationInfo',
        output: 'TaskInfo',
        onData: async function onData(status, intention, value) {}
    });
}

export default {
    init, build
}