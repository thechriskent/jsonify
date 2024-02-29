import ITransformResult, { ITransformResultMessage } from '../models/ITransformResult';
import Formatter from './Formatter';

const HTMLToSPFormat = (htmlText: string): ITransformResult => {
    const formatter = new Formatter(htmlText);
    const result = formatter.Generate();

    return {
        format: result,
        messages: formatter.Messages,
    };
};

export default HTMLToSPFormat;
