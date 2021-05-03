export function tryParse(str) {
    if (str.match(/^\s*true\s*$/i)) {
        return [true, true];
    }
    else if (str.match(/^\s*false\s*$/i)) {
        return [true, false];
    }
    else {
        return [false, false];
    }
}
export function parse(str) {
    const [ok, value] = tryParse(str);
    if (ok) {
        return value;
    }
    else {
        throw new Error(`String '${str}' was not recognized as a valid Boolean.`);
    }
}
//# sourceMappingURL=Boolean.js.map