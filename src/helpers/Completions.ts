import * as vscode from 'vscode';

const functions = ['toString', 'Number', 'Date'];
const magicStrings = ['@currentField', '@currentWeb', '@me'];
const subProps = ['title', 'email', 'sip', 'picture', 'department', 'jobTitle',
    'DisplayName', 'LocationUri', 'lookupId', 'lookupValue',
    'fileName', 'serverRelativeUrl', 'serverUrl', 'fileType',
    'desc', 'numeric', 'displayValue', 'id'];
const middleProps = ['Address', 'Coordinates', 'thumbnailRenderer'];
const addressSubProps = ['City', 'CountryOrRegion', 'State', 'Street'];
const coordinateSubProps = ['Latitude', 'Longitude'];
const thumbnailRendererSubProps = ['spItemUrl', 'fileVersion', 'sponsorToken'];

const getCompletionFunctions = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    functions.forEach((func) => {
        const item = new vscode.CompletionItem(func, vscode.CompletionItemKind.Function);
        item.insertText = new vscode.SnippetString(`${func}($1)`);
        items.push(item);
    });
    return items;
};

const getCompletionMagicStrings = (linePrefix: string): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    magicStrings.forEach((magic) => {
        const item = new vscode.CompletionItem(magic, vscode.CompletionItemKind.Keyword);
        item.insertText = linePrefix.endsWith('@') ? magic.slice(1) : magic;
        items.push(item);
    });
    return items;
};

const getCompletionSubProps = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    subProps.forEach((prop) => {
        items.push(new vscode.CompletionItem(prop, vscode.CompletionItemKind.Variable));
    });
    return items;
};

const getCompletionMiddleProps = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    middleProps.forEach((prop) => {
        const item = new vscode.CompletionItem(prop, vscode.CompletionItemKind.Variable);
        item.insertText = new vscode.SnippetString(`${prop}.`);
        item.command = { command: 'jsonify.triggerCompletion', title: 'Re-trigger completions', };
        items.push(item);
    });
    return items;
};

const getCompletionAddressSubProps = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    addressSubProps.forEach((prop) => {
        items.push(new vscode.CompletionItem(prop, vscode.CompletionItemKind.Variable));
    });
    return items;
};

const getCompletionCoordinateSubProps = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    coordinateSubProps.forEach((prop) => {
        items.push(new vscode.CompletionItem(prop, vscode.CompletionItemKind.Variable));
    });
    return items;
};

const getCompletionThumbnailRendererSubProps = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    thumbnailRendererSubProps.forEach((prop) => {
        items.push(new vscode.CompletionItem(prop, vscode.CompletionItemKind.Variable));
    });
    return items;
};

const isSubPropCompletion = (linePrefix: string): boolean => {
    // Right after a . for a subProp for @currentField or a Field Name
    // Matches either @currentField. or [$FieldName.
    return /(@currentField\.$)|(\[\$[^~#%&*{}\:<>?/+|\",.\]]+\.$)/.test(linePrefix);
};

const isAddressSubPropCompletion = (linePrefix: string): boolean => {
    // Right after the middle prop Address
    // Matches either @currentField.Address. or [$FieldName.Address.
    return /(@currentField\.Address\.$)|(\[\$[^~#%&*{}\:<>?/+|\",.\]]+\.Address\.$)/.test(linePrefix);
};

const isCoordinatesSubPropCompletion = (linePrefix: string): boolean => {
    // Right after the middle prop Coordinates
    // Matches either @currentField.Coordinates. or [$FieldName.Coordinates.
    return /(@currentField\.Coordinates\.$)|(\[\$[^~#%&*{}\:<>?/+|\",.\]]+\.Coordinates\.$)/.test(linePrefix);
};

const isThumbnailRendererSubPropCompletion = (linePrefix: string): boolean => {
    // Right after the middle prop thumbnailRenderer
    // Matches either @currentField.thumbnailRenderer. or [$FieldName.thumbnailRenderer.
    return /(@currentField\.thumbnailRenderer\.$)|(\[\$[^~#%&*{}\:<>?/+|\",.\]]+\.thumbnailRenderer\.$)/.test(linePrefix);
};

export const getCompletions = (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.CompletionItem[] | undefined => {
    const languageId = document.languageId;
    const linePrefix = document.lineAt(position).text.substring(0, position.character);

    // Check if triggered within an embedded HorseScript expression in JSON
    const isEmbeddedHorseScriptInJson = languageId === 'json' && /"[^"]*"\s*:\s*"=\s*[^"]*$/.test(linePrefix);

    // Check if triggered in a standalone HorseScript file
    const isStandaloneHorseScript = languageId === 'horsescript';

    // console.log('isEmbeddedHorseScriptInJson: ' + isEmbeddedHorseScriptInJson);
    // console.log('isStandaloneHorseScript: ' + isStandaloneHorseScript);
    // console.log('-----------------');
    
    if (!isEmbeddedHorseScriptInJson && !isStandaloneHorseScript) {
        return;
    }

    const items: vscode.CompletionItem[] = [];

    if (isSubPropCompletion(linePrefix)) {
        items.push(...getCompletionSubProps());
        items.push(...getCompletionMiddleProps());
    } else if (isAddressSubPropCompletion(linePrefix)) {
        items.push(...getCompletionAddressSubProps());
    } else if (isCoordinatesSubPropCompletion(linePrefix)) {
        items.push(...getCompletionCoordinateSubProps());
    } else if (isThumbnailRendererSubPropCompletion(linePrefix)) {
        items.push(...getCompletionThumbnailRendererSubProps());
    } else {
        items.push(...getCompletionMagicStrings(linePrefix));
        items.push(...getCompletionFunctions());
    }
    
    return items;
};
