import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

import XMLToSPFormat from '../helpers/toFormat';

suite('jsonify Tests - Wowee!', () => {
  vscode.window.showInformationMessage('Starting all tests.');

  // Tests for the XMLToSPFormat function
  test('XMLToSPFormat should fail for invalid XML', async () => {
    const invalidXML = '<invalid></xml>';
    await assert.rejects(XMLToSPFormat(invalidXML), /^Error: Unexpected close tag\nLine: 0\nColumn: 15\nChar: >$/);
  });

  test('XMLToSPFormat FangBody SVG to Format', async () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048"><path d="M1709 1668q46 8 84 31t67 56 44 76 16 89v128H384q-80 0-150-30t-122-82-82-122-30-150q0-79 30-149t82-122 122-83 150-30v128q-53 0-99 20t-82 55-55 81-20 100q0 53 20 99t55 82 81 55 100 20q25 0 49-9t42-28q18-18 27-42t10-49q0-196 73-377 35-88 85-163t116-144q117-123 177-274t61-322V384q0-53 20-99t55-82 81-55 100-20h192q62 0 110 21t94 61q26 23 53 34t63 12q27 0 50 10t40 27 28 41 10 50v128q0 40-15 75t-41 61-61 41-75 15h-64v704q0 66 11 131t34 129zm83 252q0-26-10-49t-27-41-41-28-50-10h-43q-20-49-35-95t-27-92-17-95-6-102V704q0-27 10-50t27-40 41-28 50-10h40q22 0 42-4t33-18 13-42V384q-45 0-78-9t-58-24-45-31-41-31-44-23-54-10h-192q-26 0-49 10t-41 27-28 41-10 50v192q0 26 19 45t45 19q28 0 41-13t19-32 5-42-1-41h128v64q0 40-15 75t-41 61-61 41-75 15q-48 0-91-23-32 131-93 242t-154 209q-117 123-177 274t-61 322q0 68-34 128h802q0-27-10-50t-27-40-41-28-50-10h-128q0-53-20-99t-55-82-81-55-100-20v-128q62 0 118 18t104 52 83 81 57 105h22v-512h128v546q60 35 94 94t34 128h256z" fill="#333333"></path></svg>`;
    const expectedFormat = `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "svg",
  "attributes": {
    "viewBox": "0 0 2048 2048"
  },
  "children": [
    {
      "elmType": "path",
      "attributes": {
        "d": "M1709 1668q46 8 84 31t67 56 44 76 16 89v128H384q-80 0-150-30t-122-82-82-122-30-150q0-79 30-149t82-122 122-83 150-30v128q-53 0-99 20t-82 55-55 81-20 100q0 53 20 99t55 82 81 55 100 20q25 0 49-9t42-28q18-18 27-42t10-49q0-196 73-377 35-88 85-163t116-144q117-123 177-274t61-322V384q0-53 20-99t55-82 81-55 100-20h192q62 0 110 21t94 61q26 23 53 34t63 12q27 0 50 10t40 27 28 41 10 50v128q0 40-15 75t-41 61-61 41-75 15h-64v704q0 66 11 131t34 129zm83 252q0-26-10-49t-27-41-41-28-50-10h-43q-20-49-35-95t-27-92-17-95-6-102V704q0-27 10-50t27-40 41-28 50-10h40q22 0 42-4t33-18 13-42V384q-45 0-78-9t-58-24-45-31-41-31-44-23-54-10h-192q-26 0-49 10t-41 27-28 41-10 50v192q0 26 19 45t45 19q28 0 41-13t19-32 5-42-1-41h128v64q0 40-15 75t-41 61-61 41-75 15q-48 0-91-23-32 131-93 242t-154 209q-117 123-177 274t-61 322q0 68-34 128h802q0-27-10-50t-27-40-41-28-50-10h-128q0-53-20-99t-55-82-81-55-100-20v-128q62 0 118 18t104 52 83 81 57 105h22v-512h128v546q60 35 94 94t34 128h256z"
      },
      "style": {
        "fill": "#333333"
      }
    }
  ]
}`;
    const result = await XMLToSPFormat(svg);
    assert.strictEqual(typeof result.format, 'string');
    assert.strictEqual(result.format.length > 0, true);
    assert.strictEqual(result.format, expectedFormat);
  });

  test('XMLToSPFormat Bomb SVG to format (shapes)', async () => {
    const svg = `<svg viewBox="0 0 100 100"> <rect x="35" y="0" width="30" height="20" fill="#323130"/> <circle cx="50" cy="50" r="40" fill="#201f1e" /> <ellipse cx="50" cy="12" rx="15" ry="5" fill="#323130" /> <circle cx="40" cy="40" r="15" fill="#3b3a39" fill-opacity=".5" /> <polygon points="0,75 10,100 20,75 10,50" fill="#5D3B21" stroke="#291A0E"/> <polyline points="80,75 90,100 100,75 90,50 80,75" fill="#5D3B21" stroke="#291A0E"/> <line x1="37.5" y1="85" x2="62.5" y2="85" stroke="#A96B3C"/> <text x="50" y="60" font-size="20" text-anchor="middle" dominant-baseline="middle" style="fill:#DAA520;">Wowee</text> </svg>`;
    const expectedFormat = `{
  "$schema": "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json",
  "elmType": "svg",
  "attributes": {
    "viewBox": "0 0 100 100"
  },
  "children": [
    {
      "elmType": "path",
      "style": {
        "fill": "#323130"
      },
      "attributes": {
        "d": "M 35 0 h 30 a 0 0 0 0 1 0 0 v 20 a 0 0 0 0 1 -0 0 h -30 a 0 0 0 0 1 -0 -0 v -20 a 0 0 0 0 1 0 -0"
      }
    },
    {
      "elmType": "path",
      "style": {
        "fill": "#201f1e"
      },
      "attributes": {
        "d": "M10,50a40,40 0 1,0 80,0a40,40 0 1,0 -80,0"
      }
    },
    {
      "elmType": "path",
      "style": {
        "fill": "#3b3a39",
        "fill-opacity": ".5"
      },
      "attributes": {
        "d": "M25,40a15,15 0 1,0 30,0a15,15 0 1,0 -30,0"
      }
    },
    {
      "elmType": "path",
      "style": {
        "fill": "#323130"
      },
      "attributes": {
        "d": "M 35 12 a 15 5 0 1 0 30 0 a 15 5 0 1 0 -30 0"
      }
    },
    {
      "elmType": "path",
      "style": {
        "fill": "#5D3B21",
        "stroke": "#291A0E"
      },
      "attributes": {
        "d": "M 0 75 L 10 100 L 20 75 L 10 50 Z"
      }
    },
    {
      "elmType": "path",
      "style": {
        "fill": "#5D3B21",
        "stroke": "#291A0E"
      },
      "attributes": {
        "d": "M 80 75 L 90 100 L 100 75 L 90 50 L 80 75"
      }
    },
    {
      "elmType": "path",
      "style": {
        "stroke": "#A96B3C"
      },
      "attributes": {
        "d": "M 37.5 85 L 62.5 85"
      }
    }
  ]
}`;
    const result = await XMLToSPFormat(svg);
    assert.strictEqual(typeof result.format, 'string');
    assert.strictEqual(result.format.length > 0, true);
    assert.strictEqual(result.format, expectedFormat);
  });

});