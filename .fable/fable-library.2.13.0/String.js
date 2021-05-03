import { toString as dateToString } from "./Date";
import Decimal from "./Decimal";
import Long, * as _Long from "./Long";
import { escape } from "./RegExp";
const fsFormatRegExp = /(^|[^%])%([0+\- ]*)(\d+)?(?:\.(\d+))?(\w)/;
const formatRegExp = /\{(\d+)(,-?\d+)?(?:\:([a-zA-Z])(\d{0,2})|\:(.+?))?\}/g;
// These are used for formatting and only take longs and decimals into account (no bigint)
function isNumeric(x) {
    return typeof x === "number" || x instanceof Long || x instanceof Decimal;
}
function isLessThan(x, y) {
    if (x instanceof Long) {
        return _Long.compare(x, y) < 0;
    }
    else if (x instanceof Decimal) {
        return x.cmp(y) < 0;
    }
    else {
        return x < y;
    }
}
function multiply(x, y) {
    if (x instanceof Long) {
        return _Long.op_Multiply(x, y);
    }
    else if (x instanceof Decimal) {
        return x.mul(y);
    }
    else {
        return x * y;
    }
}
function toFixed(x, dp) {
    if (x instanceof Long) {
        return String(x) + (0).toFixed(dp).substr(1);
    }
    else {
        return x.toFixed(dp);
    }
}
function toPrecision(x, sd) {
    if (x instanceof Long) {
        return String(x) + (0).toPrecision(sd).substr(1);
    }
    else {
        return x.toPrecision(sd);
    }
}
function toExponential(x, dp) {
    if (x instanceof Long) {
        return String(x) + (0).toExponential(dp).substr(1);
    }
    else {
        return x.toExponential(dp);
    }
}
function cmp(x, y, ic) {
    function isIgnoreCase(i) {
        return i === true ||
            i === 1 /* CurrentCultureIgnoreCase */ ||
            i === 3 /* InvariantCultureIgnoreCase */ ||
            i === 5 /* OrdinalIgnoreCase */;
    }
    function isOrdinal(i) {
        return i === 4 /* Ordinal */ ||
            i === 5 /* OrdinalIgnoreCase */;
    }
    if (x == null) {
        return y == null ? 0 : -1;
    }
    if (y == null) {
        return 1;
    } // everything is bigger than null
    if (isOrdinal(ic)) {
        if (isIgnoreCase(ic)) {
            x = x.toLowerCase();
            y = y.toLowerCase();
        }
        return (x === y) ? 0 : (x < y ? -1 : 1);
    }
    else {
        if (isIgnoreCase(ic)) {
            x = x.toLocaleLowerCase();
            y = y.toLocaleLowerCase();
        }
        return x.localeCompare(y);
    }
}
export function compare(...args) {
    switch (args.length) {
        case 2: return cmp(args[0], args[1], false);
        case 3: return cmp(args[0], args[1], args[2]);
        case 4: return cmp(args[0], args[1], args[2] === true);
        case 5: return cmp(args[0].substr(args[1], args[4]), args[2].substr(args[3], args[4]), false);
        case 6: return cmp(args[0].substr(args[1], args[4]), args[2].substr(args[3], args[4]), args[5]);
        case 7: return cmp(args[0].substr(args[1], args[4]), args[2].substr(args[3], args[4]), args[5] === true);
        default: throw new Error("String.compare: Unsupported number of parameters");
    }
}
export function compareOrdinal(x, y) {
    return cmp(x, y, 4 /* Ordinal */);
}
export function compareTo(x, y) {
    return cmp(x, y, 0 /* CurrentCulture */);
}
export function startsWith(str, pattern, ic) {
    if (str.length >= pattern.length) {
        return cmp(str.substr(0, pattern.length), pattern, ic) === 0;
    }
    return false;
}
export function indexOfAny(str, anyOf, ...args) {
    if (str == null || str === "") {
        return -1;
    }
    const startIndex = (args.length > 0) ? args[0] : 0;
    if (startIndex < 0) {
        throw new Error("Start index cannot be negative");
    }
    const length = (args.length > 1) ? args[1] : str.length - startIndex;
    if (length < 0) {
        throw new Error("Length cannot be negative");
    }
    if (length > str.length - startIndex) {
        throw new Error("Invalid startIndex and length");
    }
    str = str.substr(startIndex, length);
    for (const c of anyOf) {
        const index = str.indexOf(c);
        if (index > -1) {
            return index + startIndex;
        }
    }
    return -1;
}
function toHex(x) {
    if (x instanceof Long) {
        return _Long.toString(x.unsigned ? x : _Long.fromBytes(_Long.toBytes(x), true), 16);
    }
    else {
        return (Number(x) >>> 0).toString(16);
    }
}
export function printf(input) {
    return {
        input,
        cont: fsFormat(input),
    };
}
export function toConsole(arg) {
    // Don't remove the lambda here, see #1357
    return arg.cont((x) => { console.log(x); });
}
export function toConsoleError(arg) {
    return arg.cont((x) => { console.error(x); });
}
export function toText(arg) {
    return arg.cont((x) => x);
}
export function toFail(arg) {
    return arg.cont((x) => { throw new Error(x); });
}
function formatOnce(str2, rep) {
    return str2.replace(fsFormatRegExp, (_, prefix, flags, padLength, precision, format) => {
        let sign = "";
        if (isNumeric(rep)) {
            if (format.toLowerCase() !== "x") {
                if (isLessThan(rep, 0)) {
                    rep = multiply(rep, -1);
                    sign = "-";
                }
                else {
                    if (flags.indexOf(" ") >= 0) {
                        sign = " ";
                    }
                    else if (flags.indexOf("+") >= 0) {
                        sign = "+";
                    }
                }
            }
            precision = precision == null ? null : parseInt(precision, 10);
            switch (format) {
                case "f":
                case "F":
                    precision = precision != null ? precision : 6;
                    rep = toFixed(rep, precision);
                    break;
                case "g":
                case "G":
                    rep = precision != null ? toPrecision(rep, precision) : toPrecision(rep);
                    break;
                case "e":
                case "E":
                    rep = precision != null ? toExponential(rep, precision) : toExponential(rep);
                    break;
                case "x":
                    rep = toHex(rep);
                    break;
                case "X":
                    rep = toHex(rep).toUpperCase();
                    break;
                default: // AOid
                    rep = String(rep);
                    break;
            }
        }
        padLength = parseInt(padLength, 10);
        if (!isNaN(padLength)) {
            const zeroFlag = flags.indexOf("0") >= 0; // Use '0' for left padding
            const minusFlag = flags.indexOf("-") >= 0; // Right padding
            const ch = minusFlag || !zeroFlag ? " " : "0";
            if (ch === "0") {
                rep = padLeft(rep, padLength - sign.length, ch, minusFlag);
                rep = sign + rep;
            }
            else {
                rep = padLeft(sign + rep, padLength, ch, minusFlag);
            }
        }
        else {
            rep = sign + rep;
        }
        const once = prefix + rep;
        return once.replace(/%/g, "%%");
    });
}
function createPrinter(str, cont) {
    return (...args) => {
        // Make a copy as the function may be used several times
        let strCopy = str;
        for (const arg of args) {
            strCopy = formatOnce(strCopy, arg);
        }
        return fsFormatRegExp.test(strCopy)
            ? createPrinter(strCopy, cont)
            : cont(strCopy.replace(/%%/g, "%"));
    };
}
export function fsFormat(str) {
    return (cont) => {
        return fsFormatRegExp.test(str)
            ? createPrinter(str, cont)
            : cont(str);
    };
}
export function format(str, ...args) {
    if (typeof str === "object" && args.length > 0) {
        // Called with culture info
        str = args[0];
        args.shift();
    }
    return str.replace(formatRegExp, (_, idx, padLength, format, precision, pattern) => {
        let rep = args[idx];
        if (isNumeric(rep)) {
            precision = precision == null ? null : parseInt(precision, 10);
            switch (format) {
                case "f":
                case "F":
                    precision = precision != null ? precision : 2;
                    rep = toFixed(rep, precision);
                    break;
                case "g":
                case "G":
                    rep = precision != null ? toPrecision(rep, precision) : toPrecision(rep);
                    break;
                case "e":
                case "E":
                    rep = precision != null ? toExponential(rep, precision) : toExponential(rep);
                    break;
                case "p":
                case "P":
                    precision = precision != null ? precision : 2;
                    rep = toFixed(multiply(rep, 100), precision) + " %";
                    break;
                case "d":
                case "D":
                    rep = precision != null ? padLeft(String(rep), precision, "0") : String(rep);
                    break;
                case "x":
                case "X":
                    rep = precision != null ? padLeft(toHex(rep), precision, "0") : toHex(rep);
                    if (format === "X") {
                        rep = rep.toUpperCase();
                    }
                    break;
                default:
                    if (pattern) {
                        let sign = "";
                        rep = pattern.replace(/(0+)(\.0+)?/, (_, intPart, decimalPart) => {
                            if (isLessThan(rep, 0)) {
                                rep = multiply(rep, -1);
                                sign = "-";
                            }
                            rep = toFixed(rep, decimalPart != null ? decimalPart.length - 1 : 0);
                            return padLeft(rep, (intPart || "").length - sign.length + (decimalPart != null ? decimalPart.length : 0), "0");
                        });
                        rep = sign + rep;
                    }
            }
        }
        else if (rep instanceof Date) {
            rep = dateToString(rep, pattern || format);
        }
        padLength = parseInt((padLength || " ").substring(1), 10);
        if (!isNaN(padLength)) {
            rep = padLeft(String(rep), Math.abs(padLength), " ", padLength < 0);
        }
        return rep;
    });
}
export function endsWith(str, search) {
    const idx = str.lastIndexOf(search);
    return idx >= 0 && idx === str.length - search.length;
}
export function initialize(n, f) {
    if (n < 0) {
        throw new Error("String length must be non-negative");
    }
    const xs = new Array(n);
    for (let i = 0; i < n; i++) {
        xs[i] = f(i);
    }
    return xs.join("");
}
export function insert(str, startIndex, value) {
    if (startIndex < 0 || startIndex > str.length) {
        throw new Error("startIndex is negative or greater than the length of this instance.");
    }
    return str.substring(0, startIndex) + value + str.substring(startIndex);
}
export function isNullOrEmpty(str) {
    return typeof str !== "string" || str.length === 0;
}
export function isNullOrWhiteSpace(str) {
    return typeof str !== "string" || /^\s*$/.test(str);
}
export function concat(...xs) {
    return xs.map((x) => String(x)).join("");
}
export function join(delimiter, xs) {
    if (Array.isArray(xs)) {
        return xs.join(delimiter);
    }
    else {
        return Array.from(xs).join(delimiter);
    }
}
export function joinWithIndices(delimiter, xs, startIndex, count) {
    const endIndexPlusOne = startIndex + count;
    if (endIndexPlusOne > xs.length) {
        throw new Error("Index and count must refer to a location within the buffer.");
    }
    return xs.slice(startIndex, endIndexPlusOne).join(delimiter);
}
function notSupported(name) {
    throw new Error("The environment doesn't support '" + name + "', please use a polyfill.");
}
export function toBase64String(inArray) {
    let str = "";
    for (let i = 0; i < inArray.length; i++) {
        str += String.fromCharCode(inArray[i]);
    }
    return typeof btoa === "function" ? btoa(str) : notSupported("btoa");
}
export function fromBase64String(b64Encoded) {
    const binary = typeof atob === "function" ? atob(b64Encoded) : notSupported("atob");
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}
export function padLeft(str, len, ch, isRight) {
    ch = ch || " ";
    len = len - str.length;
    for (let i = 0; i < len; i++) {
        str = isRight ? str + ch : ch + str;
    }
    return str;
}
export function padRight(str, len, ch) {
    return padLeft(str, len, ch, true);
}
export function remove(str, startIndex, count) {
    if (startIndex >= str.length) {
        throw new Error("startIndex must be less than length of string");
    }
    if (typeof count === "number" && (startIndex + count) > str.length) {
        throw new Error("Index and count must refer to a location within the string.");
    }
    return str.slice(0, startIndex) + (typeof count === "number" ? str.substr(startIndex + count) : "");
}
export function replace(str, search, replace) {
    return str.replace(new RegExp(escape(search), "g"), replace);
}
export function replicate(n, x) {
    return initialize(n, () => x);
}
export function getCharAtIndex(input, index) {
    if (index < 0 || index >= input.length) {
        throw new Error("Index was outside the bounds of the array.");
    }
    return input[index];
}
export function split(str, splitters, count, removeEmpty) {
    count = typeof count === "number" ? count : undefined;
    removeEmpty = typeof removeEmpty === "number" ? removeEmpty : undefined;
    if (count && count < 0) {
        throw new Error("Count cannot be less than zero");
    }
    if (count === 0) {
        return [];
    }
    if (!Array.isArray(splitters)) {
        if (removeEmpty === 0) {
            return str.split(splitters, count);
        }
        const len = arguments.length;
        splitters = Array(len - 1);
        for (let key = 1; key < len; key++) {
            splitters[key - 1] = arguments[key];
        }
    }
    splitters = splitters.map((x) => escape(x));
    splitters = splitters.length > 0 ? splitters : [" "];
    let i = 0;
    const splits = [];
    const reg = new RegExp(splitters.join("|"), "g");
    while (count == null || count > 1) {
        const m = reg.exec(str);
        if (m === null) {
            break;
        }
        if (!removeEmpty || (m.index - i) > 0) {
            count = count != null ? count - 1 : count;
            splits.push(str.substring(i, m.index));
        }
        i = reg.lastIndex;
    }
    if (!removeEmpty || (str.length - i) > 0) {
        splits.push(str.substring(i));
    }
    return splits;
}
export function trim(str, ...chars) {
    if (chars.length === 0) {
        return str.trim();
    }
    const pattern = "[" + escape(chars.join("")) + "]+";
    return str.replace(new RegExp("^" + pattern), "").replace(new RegExp(pattern + "$"), "");
}
export function trimStart(str, ...chars) {
    return chars.length === 0
        ? str.trimStart()
        : str.replace(new RegExp("^[" + escape(chars.join("")) + "]+"), "");
}
export function trimEnd(str, ...chars) {
    return chars.length === 0
        ? str.trimEnd()
        : str.replace(new RegExp("[" + escape(chars.join("")) + "]+$"), "");
}
export function filter(pred, x) {
    return x.split("").filter((c) => pred(c)).join("");
}
export function substring(str, startIndex, length) {
    if ((startIndex + (length || 0) > str.length)) {
        throw new Error("Invalid startIndex and/or length");
    }
    return length != null ? str.substr(startIndex, length) : str.substr(startIndex);
}
//# sourceMappingURL=String.js.map