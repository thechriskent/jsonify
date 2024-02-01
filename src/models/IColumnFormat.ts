import { IFormatElement } from "./IFormatElement";

export interface IColumnFormat extends IFormatElement {
    "$schema": string;
    debugMode?: boolean;
}