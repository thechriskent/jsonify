export interface ICSSPropertyDictionary {
    [key: string]: string;
}

export interface ICSSSelectorAutomaticClasses {
    [key: string]: string[];
}

export default interface ICSSSelectorDictionary {
    [key: string]: ICSSPropertyDictionary;
}

export const inlineStylesToCSSPropertyDictionary = (inlineStyles: string | undefined): ICSSPropertyDictionary => {
    if (typeof inlineStyles === 'undefined') {
        return {};
    }
    const stylePairs = inlineStyles.split(';');
    const propertyDictionary: ICSSPropertyDictionary = {};
    stylePairs.forEach((pair) => {
        const [key, value] = pair.split(':');
        if (key && value) {
            propertyDictionary[key.trim()] = value.trim();
        }
    });
    return propertyDictionary;
};

export const cssPropertyDictionaryToInlineStyles = (propertyDictionary: ICSSPropertyDictionary): string => {
    return Object.keys(propertyDictionary).map((key) => {
        return `${key}:${propertyDictionary[key]};`;
    }).join('');
};