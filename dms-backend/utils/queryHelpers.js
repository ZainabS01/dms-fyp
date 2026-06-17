const buildDeptRegex = (dept) => {
    if (!dept) return null;
    const cleanDept = dept.trim().toUpperCase();
    if (cleanDept.includes('COMPUTER SCIENCE') || cleanDept === 'CS' || cleanDept === 'BSCS') {
        return new RegExp('^(BS COMPUTER SCIENCE|COMPUTER SCIENCE|CS|BSCS)$', 'i');
    }
    if (cleanDept.includes('SOFTWARE ENGINEERING') || cleanDept === 'SE' || cleanDept === 'BSSE') {
        return new RegExp('^(BS SOFTWARE ENGINEERING|SOFTWARE ENGINEERING|SE|BSSE)$', 'i');
    }
    if (cleanDept.includes('IT') || cleanDept.includes('INFORMATION TECHNOLOGY') || cleanDept === 'BSIT') {
        return new RegExp('^(BS INFORMATION TECHNOLOGY|IT|INFORMATION TECHNOLOGY|BSIT)$', 'i');
    }
    if (cleanDept.includes('AI') || cleanDept.includes('ARTIFICIAL INTELLIGENCE') || cleanDept === 'BSAI') {
        return new RegExp('^(BS ARTIFICIAL INTELLIGENCE|AI|ARTIFICIAL INTELLIGENCE|BSAI)$', 'i');
    }
    return new RegExp(`^${dept.trim()}$`, 'i');
};

const buildSemRegex = (sem) => {
    if (!sem) return null;
    const cleanSem = sem.trim();
    const match = cleanSem.match(/\d+/);
    if (match) {
        const num = match[0];
        return new RegExp(`^(${cleanSem}|${num}|${num}st|${num}nd|${num}rd|${num}th)(\\s*Sem(ester)?)?$`, 'i');
    }
    return new RegExp(`^${cleanSem}$`, 'i');
};

module.exports = { buildDeptRegex, buildSemRegex };
