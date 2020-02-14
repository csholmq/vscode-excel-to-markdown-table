import { TableCellAlignment } from './interfaces';

export const ALIGNED_DEFAULT_SYNTAX: TableCellAlignment = {
    prefix: "",
    postfix: "",
    adjust: 0
}

export const ALIGNED_LEFT_SYNTAX: TableCellAlignment = {
    prefix: ":",
    postfix: "",
    adjust: 1
}

export const ALIGNED_RIGHT_SYNTAX: TableCellAlignment = {
    prefix: "",
    postfix: ":",
    adjust: 2
}

export const ALIGNED_CENTER_SYNTAX: TableCellAlignment = {
    prefix: ":",
    postfix: ":",
    adjust: 3
}

