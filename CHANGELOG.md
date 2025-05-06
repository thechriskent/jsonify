# Change Log

All notable changes to the "jsonify" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Things & Stuff

## [0.5.1](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.5.1/vspackage) - 2024-11-21


### 🔨 Fixed

- Issue preventing hover cards from showing sometimes


## [0.5.0](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.5.0/vspackage) - 2024-11-21

### ➕ Added
- Code completion!
  - functions, magic strings, props, etc. all get suggested as you work along with inline documentation
- Signature Help Provider!
  - When working with operators (functions) you'll be shown details about the function and parameters
  - Supports nested operators
- Hover Provider!
  - Hovering over keywords, variables, constants, etc. will provide inline documentation along with example usage of all functions and guidance on properties and magic strings

### 🔧 Changed

- Removed support for extended Image Field subproperties (now just `fileName` as of 7/24)
  - These will now show as an error as they can no longer be used

### 🔨 Fixed

- Horsescript configuration was being ignored in embedded scenarios
  - fixes issue with inline expression bracket matching
- `toDateString` wasn't properly highlighting. Now it is.


## [0.4.0](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.4.0/vspackage) - 2024-04-30

### ➕ Added
- HorseScript!
  - Syntax Highlighting in dedicated HorseScript files (.neigh)
  - Syntax Highlighting within JSON files
- Warrior Horse Theme (Dark)
  - All colors pass strict colorblind validation
  - All colors have at least AA contrast ratio rating and most have AAA
  - Works as a standard theme (not just list formatting)


## [0.3.0](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.3.0/vspackage) - 2024-02-29

### ➕ Added

- Style element support!
  - Style elements without media queries (or using the default of all) are processed and applied
  - Support for [SPFx style theme tokens](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-theme-colors-in-your-customizations#available-theme-tokens-and-their-occurrences)
  - Support for expressions as CSS property values
  - Automatic classes for theme token usage including limited support for mapping hover classes
- Additional test for verifying style elements map correctly

### 🔨 Fixed

- In rare cases a file wasn't recognized as html and the file extension expression had a typo, oopsie!



## [0.2.1](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.2.1/vspackage) - 2024-02-15

### 🔨 Fixed

- Resolved issue with menu option not showing for html files in the explorer view



## [0.2.0](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.2.0/vspackage) - 2024-02-15

### ➕ Added

- 🧬 shx as dev dependency for cross-platform file copy operations during testing
- 🧬 Format Conversion tests for development testing
- A bunch of unit tests, aw yeah!
- HTML to Column Formats!
  - Whitelisted styles/attributes/elements map directly
  - Most other elements either resolve to a div or a span with default stylings related to their original element
  - Inline styles and attributes as styles are supported

### 🔧 Changed

- Changed underlying xml parser from [xml2js](https://www.npmjs.com/package/xml2js) to [node-html-parser](https://www.npmjs.com/package/node-html-parser)
  - Much faster (necessary for live updates on complex files)
  - xml2js was very flexible but ultimately it was designed for xml and html is just too big a beast
- Consistent property sort order
  - Properties will follow the same sorting pattern between runs
  - Style properties are grouped and sorted following the [CSScomb](https://www.npmjs.com/package/csscomb) pattern

### 🔨 Fixed

- Resolved issues with the VS Code test runner
- Realized this change log was backwards, so now the latest stuff is on top 😃



## [0.1.1](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.1.1/vspackage) - 2024-02-04

### 🔨 Fixed

- Eliminated dependency on [SVG extension](https://marketplace.visualstudio.com/items?itemName=jock.svg)

### 🗑 Removed

- Got rid of those activation events afterall since they're automatically added



## [0.1.0](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.1.0/vspackage) - 2024-02-03

### ➕ Added

- Added activation events for commands to support older versions of VS Code
- Configuration setting: `jsonify.liveUpdates` defaults to `true` (see [README](https://marketplace.visualstudio.com/items?itemName=theChrisKent.jsonify)) for details

### 🔨 Fixed

- Incorrect `$schema` attribute in generated column formats

### 🔧 Changed

- New formats now open _beside_ the target file rather than directly next to it which makes it easier to see the before and after
- Choosing `Convert to SP Format` will reuse a previous window (if it exists) rather than continually make new ones (choosing the command from the explorer menu will always create a new window)



## [0.0.1](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.0.1/vspackage) - 2024-01-31

- Initial release (Basic SVG functionality)