# Change Log

All notable changes to the "jsonify" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Things & Stuff

## [0.0.1](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.0.1/vspackage) - 2024-01-31

- Initial release (Basic SVG functionality)

## [0.1.0](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.1.0/vspackage) - 2024-02-03

### ➕ Added

- Added activation events for commands to support older versions of VS Code
- Configuration setting: `jsonify.liveUpdates` defaults to `true` (see [README](https://marketplace.visualstudio.com/items?itemName=theChrisKent.jsonify)) for details

### 🔨 Fixed

- Incorrect `$schema` attribute in generated column formats

### 🔧 Changed

- New formats now open _beside_ the target file rather than directly next to it which makes it easier to see the before and after
- Choosing `Convert to SP Format` will reuse a previous window (if it exists) rather than continually make new ones (choosing the command from the explorer menu will always create a new window)

## [0.1.1](https://marketplace.visualstudio.com/_apis/public/gallery/publishers/theChrisKent/vsextensions/jsonify/0.1.1/vspackage) - 2024-02-04

### 🔨 Fixed

- Eliminated dependency on [SVG extension](https://marketplace.visualstudio.com/items?itemName=jock.svg)

### 🗑 Removed

- Got rid of those activation events afterall since they're automatically added