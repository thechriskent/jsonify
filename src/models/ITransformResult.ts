import { IColumnFormat } from ".";

export interface ITransformResultMessage {
    message: string;
    level: 'critical' | 'warning' | 'info';
}

export default interface ITransformResult {
    format: string;
    messages: ITransformResultMessage[];
}

export const transformResultMessageToString = (message: ITransformResultMessage): string => {
    switch (message.level) {
        case 'critical':
            return `❌ ${message.message}`;
        case 'warning':
            return `⚠️ ${message.message}`;
        default:
            return `🐴 ${message.message}`;
    }
};