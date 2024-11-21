import * as vscode from 'vscode';

declare interface IParameterDetail {
    label: string;
    documentation?: string;
}

declare interface ICompletionDetail {
    value: string;
    detail?: string;
    documentation?: string;
    parameters?: IParameterDetail[]
}

const magicStrings: ICompletionDetail[] = [
    { value: '@currentField', detail: 'Current field value', documentation: "This will be replaced with the value of the current field.\n\nSome field types are represented as objects. To output a value from an object, refer to a particular property inside that object. For example, if the current field is a person/group field, specify @currentField.title to retrieve the person's name, which is normally displayed in list views." },
    { value: '@currentWeb', detail: 'URL for site', documentation: 'This will be replaced with the absolute URL for the site. This is equivalent to the webAbsoluteUrl value within the page context. This value is only available in SharePoint Online.' },
    { value: '@me', detail: "Current user's email", documentation: 'This will be replaced with the email address of the currently logged-in user.' },
    { value: '@now', detail: 'Date/time at render', documentation: 'This will be replaced with the current date and time (at render).' },
    { value: '@rowIndex', detail: 'Rendered row number', documentation: 'This will be replaced with the rendered index of a row within a view. This value is based on render position and will remain consistent based on position even as views are sorted and filtered. Indexes start at 0. This value is only available in SharePoint Online.' },
    { value: '@window.innerHeight', detail: 'Height of the window', documentation: 'This will be replaced with the height of the browser window in pixels (at render).' },
    { value: '@window.innerWidth', detail: 'Width of the window', documentation: 'This will be replaced with the width of the browser window in pixels (at render).' },
    { value: '@thumbnail.small', detail: 'Small thumbnail URL', documentation: 'This will be replaced with a URL to a small thumbnail image. You can also specify a bounding size like @thumbnail.100 or @thumbnail.100x200. No value on non-file items including folders.' },
    { value: '@thumbnail.medium', detail: 'Medium thumbnail URL', documentation: 'This will be replaced with a URL to a medium thumbnail image. You can also specify a bounding size like @thumbnail.100 or @thumbnail.100x200. No value on non-file items including folders.' },
    { value: '@thumbnail.large', detail: 'Large thumbnail URL', documentation: 'This will be replaced with a URL to a large thumbnail image. You can also specify a bounding size like @thumbnail.100 or @thumbnail.100x200. No value on non-file items including folders.' },
    { value: '@isSelected', detail: 'Is selected', documentation: 'This will be replaced with true for the selected item(s) in a view and false if not.' },
    { value: '@lcid', detail: 'LCID of the current culture', documentation: 'This will be replaced with the LCID of the current culture. This can be used to format the date, time, and numbers.' },
    { value: '@UIlcid', detail: 'LCID of the current UI culture', documentation: 'This will be replaced with the LCID of the current UI culture. This can be used to show localized display strings.' },
];

const functions: ICompletionDetail[] = [
    // Unary operators
    { value: 'toString', detail: 'Convert to string', documentation: 'Returns a string representing the object.\n\n=toString(45) results in "45"' },
    { value: 'Number', detail: 'Convert to number', documentation: 'Returns the numeric value, if the operand is not a number, NaN is returned.\n\n=Number(\'365\') results in 365\n=Number(\'Wowee\') results in NaN\n=Number(Date(\'12/26/1981\')) results in 378190800000' },
    { value: 'Date', detail: 'Convert to date/time', documentation: 'Returns a datetime object (converts strings or numbers to dates, sensitive to locale)\n\n=Date(\'12/26/1981\') results in 12/26/1981, 12:00:00 AM' },
    { value: 'cos', detail: 'Cosine', documentation: 'Returns the cosine of the specified angle that should be specified in radians\n\n=cos(5) results in 0.28366218546322625' },
    { value: 'sin', detail: 'Sine', documentation: 'Returns the sine of a number\n\n=sin(90) results in 0.8939966636005579' },
    { value: 'toDateString', detail: 'Date to string', documentation: 'Returns a date in a short-friendly format\n\n=toDateString(@now) result doesn\'t vary based on the user\'s locale and it will look like "Wed Aug 03 2022"' },
    { value: 'toLocaleString', detail: 'Date to string (localized)', documentation: 'Returns a language-sensitive representation of a date\n\n=toLocaleString(@now) results vary based on the user\'s locale, but en-us looks like "2/5/2019, 1:22:24 PM"' },
    { value: 'toLocaleDateString', detail: 'Date to string (date only)', documentation: 'Returns a language-sensitive representation of just the date portion of a date\n\n=toLocaleDateString(@now) results vary based on the user\'s locale, but en-us looks like "2/5/2019"' },
    { value: 'toLocaleTimeString', detail: 'Date to string (time only)', documentation: 'Returns a language-sensitive representation of just the time portion of a date\n\n=toLocaleTimeString(@now) results vary based on the user\'s locale, but en-us looks like "1:22:24 PM"' },
    { value: 'toLowerCase', detail: 'Convert to lower case', documentation: 'Returns the value converted to lower case (only works on strings)\n\n=toLowerCase(\'DogFood\') results in "dogfood"' },
    { value: 'abs', detail: 'Absolute value', documentation: 'Returns the absolute value for a given number\n\n=abs(-45) results in 45' },
    { value: 'length', detail: 'Length of an array', documentation: 'Returns the number of items in an array (multi-select person or choice field), for all other value types it returns 1 when true and 0 when false. It does NOT provide the length of a string value.\n\n=length(@currentField) might result in 2 if there are two selected values\n=length(\'Some Text\') results in 1\n=length(\'\') results in 0\n=length(45) results in 1\n=length(0) results in 0' },
    { value: 'floor', detail: 'Round down', documentation: 'Returns the largest integer less than or equal to a given number\n\n=floor(45.5) results in 45' },
    { value: 'ceiling', detail: 'Round up', documentation: 'Rounds the given number up to the next largest whole number or integer\n\n=ceiling(45.5) results in 46' },
    { value: 'getDate', detail: 'Get day of month', documentation: 'Returns the day of the month of the given date\n\n=getDate(Date(\'12/26/1981\')) results in 26' },
    { value: 'getMonth', detail: 'Get month', documentation: 'Returns the month in the specified date according to local time, as a zero-based value (where zero indicates the first month of the year)\n\n=getMonth(Date(\'12/26/1981\')) results in 11' },
    { value: 'getYear', detail: 'Get year', documentation: 'Returns the year of the given date\n\n=getYear(Date(\'12/26/1981\')) results in 1981' },
    { value: 'toUpperCase', detail: 'Convert to upper case', documentation: 'Returns the value converted to upper case (only works on strings)\n\n=toUpperCase(\'DogFood\') results in "DOGFOOD"' },
    { value: 'loopIndex', detail: 'Current index of a loop', documentation: 'Returns the current index of the given loop. Indexes start at 0.\n\n=loopIndex(\'choiceIterator\') could result in 0' },

    // Binary operators
    { value: 'indexOf', detail: 'Find index of', documentation: 'Returns the index value of the first occurrence of the search term within the string (or array). Indexes start at 0. If the search term isn\'t found within the text (or array), -1 is returned. This operator is case-sensitive.\n\n=indexOf(\'DogFood\', \'Dog\') results in 0\n=indexOf(\'DogFood\', \'F\') results in 3\n=indexOf(\'DogFood\', \'Cat\') results in -1\n=indexOf(\'DogFood\', \'f\') results in -1',
        parameters: [{ label: 'Target', documentation: 'The text (or array) to search within' },
                     { label: 'Search term', documentation: 'The text to search for' }] },
    { value: 'join', detail: 'Join array', documentation: 'Returns a string concatenation of the array values separated by the separating string.\n\n=join(@currentField, \', \') might result in "Apple, Orange, Cherry" (depending on the selected values)\n=join(@currentField.title, \'|\') might result in "Megan Bowen|Alex Wilber" (depending on the selected persons)',
        parameters: [{ label: 'Array', documentation: 'The array to join (ie multi-select person or choice field)' },
                     { label: 'Separator', documentation: 'The string to separate each value' }] },
    { value: 'pow', detail: 'Raise to power', documentation: 'Returns the base to the exponent power.\n\n=pow(2,3) results in 8',
        parameters: [{ label: 'Base', documentation: 'The base number' },
                     { label: 'Exponent', documentation: 'The exponent number' }] },
    { value: 'lastIndexOf', detail: 'Find last index of', documentation: 'Returns the position of the last occurrence of a specified value in a string (or array)\n\n=lastIndexOf(\'DogFood DogFood\', \'Dog\') results in 8\n=lastIndexOf(\'DogFood DogFood\', \'F\') results in 11\n=lastIndexOf(\'DogFood DogFood\', \'Cat\') results in -1\n=lastIndexOf(\'DogFood DogFood\', \'f\') results in -1',
        parameters: [{ label: 'Target', documentation: 'The text (or array) to search within' },
                     { label: 'Search term', documentation: 'The text to search for' }] },
    { value: 'startsWith', detail: 'Starts with', documentation: 'Determines whether a string begins with the characters of a specified string\n\n=startsWith(\'DogFood\', \'Dog\') results in true\n=startsWith(\'DogFood\', \'Food\') results in false',
        parameters: [{ label: 'Target', documentation: 'The text to search' },
                     { label: 'Search term', documentation: 'The text to search for' }] },
    { value: 'endsWith', detail: 'Ends with', documentation: 'Determines whether a string ends with the characters of a specified string\n\n=endsWith(\'DogFood\', \'Dog\') results in false\n=endsWith(\'DogFood\', \'Food\') results in true',
        parameters: [{ label: 'Target', documentation: 'The text to search' },
                     { label: 'Search term', documentation: 'The text to search for' }] },
    { value: 'getUserImage', detail: 'Get user image', documentation: 'Returns a URL pointing to a user\'s profile image for a given email and preferred size\n\n=getUserImage(\'kaylat@contoso.com\', \'small\') returns a URL pointing to user\'s profile picture in small resolution\n==getUserImage(\'kaylat@contoso.com\', \'s\') returns a URL pointing to user\'s profile picture in small resolution\n=getUserImage(\'kaylat@contoso.com\', \'medium\') returns a URL pointing to user\'s profile picture in medium resolution\n=getUserImage(\'kaylat@contoso.com\', \'m\') returns a URL pointing to user\'s profile picture in medium resolution\n=getUserImage(\'kaylat@contoso.com\', \'large\') returns a URL pointing to user\'s profile picture in large resolution\n=getUserImage(\'kaylat@contoso.com\', \'l\') returns a URL pointing to user\'s profile picture in large resolution',
        parameters: [{ label: 'Email', documentation: 'The email address of the user' },
                     { label: 'Size', documentation: 'The preferred size of the image (\'small\', \'s\' \'medium\', \'m\' \'large\', or \'l\')' }] },
    { value: 'appendTo', detail: 'Append to array', documentation: 'Returns an array with the given entry appended to the given array.\n\n=appendTo(@currentField, \'Choice 4\') returns an array with "Choice 4" added to the @currentField array\n=appendTo(@currentField, \'kaylat@contoso.com\') returns an array with "kaylat@contoso.com" added to the @currentField array',
        parameters: [{ label: 'Array', documentation: 'The array to append to' },
                     { label: 'Value', documentation: 'The value to append' }] },
    { value: 'removeFrom', detail: 'Remove from array', documentation: 'Returns an array with the given entry removed from the given array, if present.\n\n=removeFrom(@currentField, \'Choice 4\') returns an array with "Choice 4" removed from the @currentField array\n=removeFrom(@currentField, \'kaylat@contoso.com\') returns an array with "kaylat@contoso.com" removed from the @currentField array',
        parameters: [{ label: 'Array', documentation: 'The array to remove from' },
                     { label: 'Value', documentation: 'The value to remove' }] },
    { value: 'split', detail: 'Split string', documentation: 'Divides the given string into an ordered list of substrings by searching for the given pattern, and returns an array of these substrings.\n\n=split(\'Hello World\', \' \') returns an array with two strings - "Hello" and "World"',
        parameters: [{ label: 'String', documentation: 'The string to split' },
                     { label: 'Pattern', documentation: 'The pattern to split by' }] },
    { value: 'addDays', detail: 'Add days to date', documentation: 'Returns a datetime object with days added (or deducted) from the given datetime value.\n\n=addDays(Date(\'11/14/2021\'), 3) returns 11/17/2021, 12:00:00 AM\n=addDays(Date(\'11/14/2021\'), -1) returns a 11/13/2021, 12:00:00 AM',
        parameters: [{ label: 'Date', documentation: 'The date to add to' },
                     { label: 'Days', documentation: 'The number of days to add (use a negative number to subtract)' }] },
    { value: 'addMinutes', detail: 'Add minutes to date', documentation: 'Returns a datetime object with minutes added (or deducted) from the given datetime value.\n\n=addMinutes(Date(\'11/14/2021\'), 3) returns 11/14/2021, 12:03:00 AM\n=addMinutes(Date(\'11/14/2021\'), -1) returns a 11/13/2021, 11:59:00 AM',
        parameters: [{ label: 'Date', documentation: 'The date to add to' },
                     { label: 'Minutes', documentation: 'The number of minutes to add (use a negative number to subtract)' }] },

    //Ternary operators
    { value: 'substring', detail: 'Substring of a string', documentation: 'Returns the part of the string between the start and end indices. Only available in SharePoint Online.\n\n=substring(\'DogFood\', 3, 4) results in F\n=substring(\'DogFood\', 4, 3) results in F\n=substring(\'DogFood\', 3, 6) results in Foo\n=substring(\'DogFood\', 6, 3) results in Foo\n\nThe substring() method returns the part of the string between the start and end indexes or to the end of the string.',
        parameters: [{ label: 'String', documentation: 'The string to extract from' },
                     { label: 'Start index', documentation: 'The character position to start the extraction (0-based)' },
                     { label: 'End index', documentation: 'The character position to end the extraction (0-based)' }] },
    { value: 'replace', detail: 'Replace string value', documentation: 'Searches a string (or array) for a specified value and returns a new string (or array) where the specified value is replaced. For strings, only the first instance of the value will be replaced.\n\n=replace(\'Hello world\', \'world\', \'everyone\') results in Hello everyone\n=replace([$MultiChoiceField], \'Choice 1\', \'Choice 2\') returns an array replacing "Choice 1" with "Choice 2"\n=replace([$MultiUserField], @me, \'kaylat@contoso.com\') returns an array replacing @me with "kaylat@contoso.com"',
        parameters: [{ label: 'String', documentation: 'The string to search' },
                     { label: 'Search term', documentation: 'The text to search for' },
                     { label: 'Replacement', documentation: 'The text to replace the search term with' }] },
    { value: 'replaceAll', detail: 'Replace all', documentation: 'Searches a string for a specified value and returns a new string (or array) where the specified value is replaced. For strings, all instances of the value will be replaced.\n\n=replaceAll(\'H-e-l-l-o W-o-r-l-d\', \'-\', \'\') results in "Hello World"',
        parameters: [{ label: 'String', documentation: 'The string to search' },
                     { label: 'Search term', documentation: 'The text to search for' },
                     { label: 'Replacement', documentation: 'The text to replace all occurrences of the search term with' }] },
    { value: 'padStart', detail: 'Pad the start of a string', documentation: 'Pads the current string with another string until the resulting string reaches the given length. The padding is applied from the start of the current string.\n\n=padStart(\'DogFood\', 10, \'A\') results in "AAADogFood"\n=padStart(\'DogFood\', 10, \'AB\') results in "ABADogFood"\n=padStart(\'DogFood\', 5, \'A\') results in "DogFood"',
        parameters: [{ label: 'String', documentation: 'The string to pad' },
                     { label: 'Length', documentation: 'The length of the resulting string' },
                     { label: 'Padding', documentation: 'The string to pad with' }] },
    { value: 'padEnd', detail: 'Pad string from end', documentation: 'Pads the current string with a given string until the resulting string reaches the given length. The padding is applied from the end of the current string.\n\n=padEnd(\'DogFood\', 10, \'A\') results in "DogFoodAAA"\n=padEnd(\'DogFood\', 10, \'AB\') results in "DogFoodABA"\n=padEnd(\'DogFood\', 5, \'A\') results in "DogFood"',
        parameters: [{ label: 'String', documentation: 'The string to pad' },
                     { label: 'Length', documentation: 'The length of the resulting string' },
                     { label: 'Padding', documentation: 'The string to pad with' }] },
    { value: 'getThumbnailImage', detail: 'Get thumbnail image URL', documentation: 'Returns a URL pointing to an image for a given image field and preferred size.\n\n=getThumbnailImage([$ImageField], 400, 200) results in a URL pointing to an image for a given image field with 400 width and 200 height',
        parameters: [{ label: 'Image field', documentation: 'The image field to get the image from' },
                     { label: 'Width', documentation: 'The preferred width of the image' },
                     { label: 'Height', documentation: 'The preferred height of the image' }] },
];

const subProps: ICompletionDetail[] = [
    { value: 'title', detail: 'Person\'s name', documentation: 'Person\'s name by default. However, if the person field\'s Show Field has been adjusted, it may change the value of the title property. For example, a person field with the Show Field configured as Department will have the person\'s department for the title property.' },
    { value: 'id', detail: 'Person\'s ID', documentation: 'The ID of the person.' },
    { value: 'email', detail: 'Person\'s email address', documentation: 'The email address of the person.' },
    { value: 'sip', detail: 'Person\'s SIP', documentation: 'The SIP address of the person.' },
    { value: 'picture', detail: 'Person\'s picture URL', documentation: 'The URL of the person\'s profile picture.' },
    { value: 'department', detail: 'Person\'s department', documentation: 'The department of the person.' },
    { value: 'jobTitle', detail: 'Person\'s job title', documentation: 'The job title of the person.' },

    { value: 'LocationUri', detail: 'Location URI', documentation: 'The location URI.' },
    { value: 'DisplayName', detail: 'Location display name', documentation: 'The display name of the location.' },

    { value: 'lookupId', detail: 'Lookup ID', documentation: 'The ID of the referenced item.' },
    { value: 'lookupValue', detail: 'Lookup value', documentation: 'The value of the referenced item.' },

    { value: 'fileName', detail: 'Image file name', documentation: 'The name of the image file.' },

    { value: 'desc', detail: 'Hyperlink description', documentation: 'The display value of a hyperlink field' },
    { value: 'numeric', detail: 'Numeric approval value', documentation: 'The numeric value of a moderation status field.\n\n0: Approved\n1: Denied\n2: Pending\n3: Draft\n4: Scheduled' },
    { value: 'displayValue', detail: 'Display value', documentation: 'The display value of the item.' },
];

const middleProps: ICompletionDetail[] = [
    { value: 'Address', detail: 'Location address', documentation: 'The address of the location. Cannot be used on its own, you must reference one of the sub properties (City, CountryOrRegion, State, Street).' },
    { value: 'Coordinates', detail: 'Location coordinates', documentation: 'The coordinates of the location. Cannot be used on its own, you must reference one of the sub properties (Latitude, Longitude).' },
];

const addressSubProps: ICompletionDetail[] = [
    { value: 'City', detail: 'Location city', documentation: 'The city of the location.' },
    { value: 'CountryOrRegion', detail: 'Location country or region', documentation: 'The country or region of the location.' },
    { value: 'State', detail: 'Location state', documentation: 'The state of the location.' },
    { value: 'Street', detail: 'Location street', documentation: 'The street of the location.' },
];

const coordinateSubProps: ICompletionDetail[] = [
    { value: 'Latitude', detail: 'Location latitude', documentation: 'The latitude of the location.' },
    { value: 'Longitude', detail: 'Location longitude', documentation: 'The longitude of the location.' },
];

const metadataProps: ICompletionDetail[] = [
    { value: 'DisplayName', detail: 'Field display name', documentation: 'The display name of the field.' },
];



const getCompletionFunctions = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    functions.forEach((func) => {
        const item = new vscode.CompletionItem(func.value, vscode.CompletionItemKind.Function);
        item.insertText = new vscode.SnippetString(`${func.value}($1)`);
        item.command = { command: 'editor.action.triggerParameterHints', title: 'Trigger Parameter Hints', };
        item.detail = func.detail;
        item.documentation = func.documentation;
        items.push(item);
    });
    return items;
};

const getCompletionMagicStrings = (linePrefix: string): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    magicStrings.forEach((magic) => {
        const item = new vscode.CompletionItem(magic.value, vscode.CompletionItemKind.Keyword);
        item.insertText = linePrefix.endsWith('@') ? magic.value.slice(1) : magic.value;
        item.detail = magic.detail;
        item.documentation = magic.documentation;
        items.push(item);
    });
    return items;
};

const getCompletionSubProps = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    subProps.forEach((prop) => {
        const item = new vscode.CompletionItem(prop.value, vscode.CompletionItemKind.Variable);
        item.detail = prop.detail;
        item.documentation = prop.documentation;
        items.push(item);
    });
    return items;
};

const getCompletionMetadataProps = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    metadataProps.forEach((prop) => {
        const item = new vscode.CompletionItem(prop.value, vscode.CompletionItemKind.Variable);
        item.detail = prop.detail;
        item.documentation = prop.documentation;
        items.push(item);
    });
    return items;
};

const getCompletionMiddleProps = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    middleProps.forEach((prop) => {
        const item = new vscode.CompletionItem(prop.value, vscode.CompletionItemKind.Variable);
        item.insertText = new vscode.SnippetString(`${prop.value}.`);
        item.command = { command: 'jsonify.triggerCompletion', title: 'Re-trigger completions', };
        item.detail = prop.detail;
        item.documentation = prop.documentation;
        items.push(item);
    });
    return items;
};

const getCompletionAddressSubProps = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    addressSubProps.forEach((prop) => {
        const item = new vscode.CompletionItem(prop.value, vscode.CompletionItemKind.Variable);
        item.detail = prop.detail;
        item.documentation = prop.documentation;
        items.push(item);
    });
    return items;
};

const getCompletionCoordinateSubProps = (): vscode.CompletionItem[] => {
    const items: vscode.CompletionItem[] = [];
    coordinateSubProps.forEach((prop) => {
        const item = new vscode.CompletionItem(prop.value, vscode.CompletionItemKind.Variable);
        item.detail = prop.detail;
        item.documentation = prop.documentation;
        items.push(item);
    });
    return items;
};

export const isSubPropCompletion = (linePrefix: string): boolean => {
    // Right after a . for a subProp for @currentField or a Field Name
    // Matches either @currentField. or [$FieldName.
    return /(@currentField\.$)|(\[\$[^~#%&*{}\:<>?/+|\",.\]]+\.$)/.test(linePrefix);
};

export const isMetatdataPropCompletion = (linePrefix: string): boolean => {
    // Right after a . for a metadata prop for a Field Name
    // Matches [!FieldName.
    return /\[![^~#%&*{}\:<>?/+|\",.\]]+\.$/.test(linePrefix);
};

export const isAddressSubPropCompletion = (linePrefix: string): boolean => {
    // Right after the middle prop Address
    // Matches either @currentField.Address. or [$FieldName.Address.
    return /(@currentField\.Address\.$)|(\[\$[^~#%&*{}\:<>?/+|\",.\]]+\.Address\.$)/.test(linePrefix);
};

export const isCoordinatesSubPropCompletion = (linePrefix: string): boolean => {
    // Right after the middle prop Coordinates
    // Matches either @currentField.Coordinates. or [$FieldName.Coordinates.
    return /(@currentField\.Coordinates\.$)|(\[\$[^~#%&*{}\:<>?/+|\",.\]]+\.Coordinates\.$)/.test(linePrefix);
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

    if (isMetatdataPropCompletion(linePrefix)) {
        items.push(...getCompletionMetadataProps());
    } else if (isSubPropCompletion(linePrefix)) {
        items.push(...getCompletionSubProps());
        items.push(...getCompletionMiddleProps());
    } else if (isAddressSubPropCompletion(linePrefix)) {
        items.push(...getCompletionAddressSubProps());
    } else if (isCoordinatesSubPropCompletion(linePrefix)) {
        items.push(...getCompletionCoordinateSubProps());
    } else {
        items.push(...getCompletionMagicStrings(linePrefix));
        items.push(...getCompletionFunctions());
    }

    return items;
};


export const findFunctionName = (linePrefix: string): string => {
    const latestOpenParen = linePrefix.lastIndexOf('(');
    const latestCloseParen = linePrefix.lastIndexOf(')');
    if (latestOpenParen > latestCloseParen) {
        // There is an open paren that hasn't been closed
        const functionNameMatch = linePrefix.substring(0, latestOpenParen+1).match(/([a-zA-Z]+)\($/);
        if (functionNameMatch) {
            return functionNameMatch[1];
        } else {
            return '';
        }
    } else {
        return findFunctionName(linePrefix.substring(0, latestOpenParen-1));
    }
};

export const findParameterIndex = (linePrefix: string): number => {
    const latestOpenParen = linePrefix.lastIndexOf('(');
    const latestCloseParen = linePrefix.lastIndexOf(')');
    const latestComma = linePrefix.lastIndexOf(',');
    if (latestOpenParen < latestCloseParen) {
        // Wipe out that nested function call
        return findParameterIndex(linePrefix.substring(0, latestOpenParen) + 'FUNC' + linePrefix.slice(latestCloseParen+1));
    } else {
        return linePrefix.match(/,/)?.length ?? 0;
    }
};

export const getSignatureInformation = (functionName: string): vscode.SignatureInformation | undefined => {
    const func = functions.find((f) => f.value === functionName);
    if (func) {
        const paramNames: string[] = [];
        const paramInfo: vscode.ParameterInformation[] = [];

        if (func.parameters) {
            func.parameters.forEach((param) => {
                paramNames.push(param.label);
                paramInfo.push(new vscode.ParameterInformation(param.label, new vscode.MarkdownString(param.documentation)));
            });
        }

        const signature = new vscode.SignatureInformation(`${func.value}(${paramNames.join(', ')})`);
        signature.documentation = new vscode.MarkdownString(func.documentation);
        signature.parameters = paramInfo;
        return signature;
    }
};