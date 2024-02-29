import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';

import * as fs from 'fs';
import * as path from 'path';
import HTMLToSPFormat from '../helpers/toFormat';


declare interface IFormatTest {
  source: string;
  note?: string;
}

suite('jsonify Tests - Wowee!', () => {
  vscode.window.showInformationMessage('Starting all tests.');

  // Tests for the XMLToSPFormat function
  test('HTMLToSPFormat - Invalid HTML (undefined result)', async () => {
    const invalidXML = '<invalid></xml>';
    const result = HTMLToSPFormat(invalidXML);
    assert.equal(result.format, undefined);
  });

  // Tests file conversions to formats
  //  To include additional tests, add a new entry for the source file
  //  and add a new file with the expected output with the same file name
  //  and a .json extension in the test/data folder
  //  The note is optional and is used to provide justification for the test
  const formatMaps: IFormatTest[] = [
    { source:'FangBody.svg', note: 'Simple SVG' },
    { source:'Bomb.svg', note: 'SVG Shapes'},
    { source:'PlainText.html', note: 'Text only' },
    { source:'htmlFullBasic.html', note: 'Basic Elements in HTML' },
    { source:'htmlSnippetBasic.html', note: 'Basic Elements loose' },
    { source:'htmlBoldItalic.html', note: 'span with style mapping'},
    { source:'htmlDivSwaps.html', note: 'Elements that become divs'},
    { source:'htmlSpanSwaps.html', note: 'Elements that become spans'},
    { source:'htmlWithStyleElement.html', note: 'Style element in HTML' },
  ];

  formatMaps.forEach((formatMap: IFormatTest) => {
    test(`HTMLToSPFormat - Conversion: ${formatMap.source}${typeof formatMap.note !== 'undefined' ? ` (${formatMap.note})` : ''}`, async () => {
      // Go find the source file and grab the contents
      const sourcePath = path.join(__dirname, 'data', formatMap.source);
      const sourceContent = fs.readFileSync(sourcePath, { encoding: 'utf8' });

      // Go find the target file and grab the contents
      const targetFile = formatMap.source.substring(0, formatMap.source.lastIndexOf('.')) + '.json';
      const targetPath = path.join(__dirname, 'data', targetFile);
      const expectedContent = fs.readFileSync(targetPath, { encoding: 'utf8' })
        .replace(/\r\n/g, '\n'); // Normalize line endings

      // Convert the source content to the SP format and compare it to the expected content
      const result = await HTMLToSPFormat(sourceContent);
      assert.strictEqual(typeof result.format, 'string');
      assert.strictEqual(result.format.length > 0, true);
      assert.strictEqual(result.format, expectedContent);
    });
  });

});
