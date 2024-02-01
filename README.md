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

None

## Known Issues

This is in very early preview, so please report any issues that come up. But here's a few off the top of my head:

- Style tags are ignored
- Classes aren't filtered (all are passed through regardless of effect)
- Some CSS styles aren't fully filtered

## Release Notes

Users appreciate release notes as you update your extension.

### 0.0.1

Initial release of SVG functionality