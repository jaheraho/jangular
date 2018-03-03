function getType(val) {
    if (val instanceof Array) {
        return 'array'
    } else if (val instanceof Date) {
        return 'date'
    } else if (val instanceof RegExp) {
        return 'regexp'
    } else if (val instanceof Error) {
        return 'error'
    } else if (!!(val && val.constructor && val.call && val.apply)) {
        return 'function';
    } else if (!val && val !== false && val !== '' && val !== 0 && typeof val !== 'undefined') {
        return 'null';
    } else if (typeof val === 'number' && parseInt(val) !== val) {
        return 'float';
    } else {
        return typeof val;
    }
}