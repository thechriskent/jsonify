# jsonify

jsonify lets you instantly convert SVG files to Microsoft SharePoint List Formats. Right click on an SVG file and choose `Convert to SP List Format` and a new editor will open with a column format that draws your image. Wowee!

## Features

- Maps all supported attributes and styles
- Automatically converts common shapes (rect, circle, ellipse, line, polyline, and polygon) to paths
- Collapses element groups

Just open an SVG file, right click and choose `Convert to SP List Format` to have a new window open with a column format that will display your SVG.

![jsonify in action](./assets/jsonify.gif)


## Requirements

None

## Extension Settings

### jsonify.liveUpdates
This configuration option controls whether the JSON formatting updates in real-time as you make changes to your SVG or HTML files.

When `jsonify.liveUpdates` is set to `true` (default), the extension will automatically update the formatted JSON in the associated editor window as you make changes to your files. This allows you to see the effects of your changes immediately, without needing to manually trigger the formatting.

When `jsonify.liveUpdates` is set to `false`, the extension will not automatically update the formatted JSON. Instead, you will need to manually trigger the formatting by running the `Convert to SP Format` command. This will reuse the window when possible.

> Please note that live updates may have a performance impact, especially on larger files. If you experience performance issues, consider turning off live updates.

You can change this setting in your workspace or user settings. Here's how:

Open the settings by pressing Ctrl+, on Windows or Cmd+, on Mac.
Search for jsonify.liveUpdates.
Toggle the setting on or off as desired.

## Known Issues

This is in very early preview, so please report any issues that come up. But here's a few off the top of my head:

- Style tags are ignored
- Classes aren't filtered (all are passed through regardless of effect)
- Some CSS styles aren't fully filtered

## Release Notes

### 0.0.1

Initial release of SVG functionality

### 0.1.0

#### Features Birthed

- New formats now open __beside__ the target file rather than directly next to it which makes it easier to see the before and after
- Choosing `Convert to SP Format` will reuse a previous window (if it exists) rather than continually make new ones (choosing the command from the exporer menu will always create a new window)
- Added activation events for commands to support older versions of VS Code
- When `jsonify.liveUpdates` is enabled (default), changes to the original file will be automatically reflected in the generated format (until closed or saved)

#### Bugs Murdered

- Incorrect $schema attribute in generated format