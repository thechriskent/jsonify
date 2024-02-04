# jsonify

jsonify lets you instantly convert SVG files to [**Microsoft SharePoint List Formats**](https://aka.ms/spdocs-column-formatting). Right click on an SVG file and choose `Convert to SP List Format` and a new editor will open with a column format that draws your image. Wowee!

## Features

- Maps all supported attributes and styles
- Automatically converts common shapes (rect, circle, ellipse, line, polyline, and polygon) to paths
- Collapses element groups
- Generated formats are kept in sync with your original file _(until you save or close them)_[^1]

Just open an SVG file, right click and choose `Convert to SP List Format` to have a new window open with a column format that will display your SVG.

![jsonify in action](./assets/jsonify.gif)

[^1]: `jsonify.liveUpdates` must be set to `true`


## Requirements

**None** - However, works great with the [SP Formatter extension](https://marketplace.visualstudio.com/items?itemName=s-kainet.sp-formatter) to enable live previews of your SharePoint List Formats!

## Extension Settings

### jsonify.liveUpdates
This configuration option controls whether the JSON formatting updates in real-time as you make changes to your SVG or HTML files.

When `jsonify.liveUpdates` is set to `true` (default), the extension will automatically update the formatted JSON in the associated editor window as you make changes to your files. This allows you to see the effects of your changes immediately, without needing to manually trigger the formatting.

When `jsonify.liveUpdates` is set to `false`, the extension will not automatically update the formatted JSON. Instead, you will need to manually trigger the formatting by running the `Convert to SP Format` command. This will reuse the window when possible.

> Please note that live updates may have a performance impact, especially on larger files. If you experience performance issues, consider turning off live updates.

You can change this setting in your workspace or user settings. Here's how:

Open the settings by pressing Ctrl+, on Windows or Cmd+, on Mac.
Search for `jsonify.liveUpdates`.
Toggle the setting on or off as desired.

## Known Issues

This is in very early preview, so please report any issues that come up. But here's a few off the top of my head:

- Style elements are ignored (inline styles are mapped)
- Classes aren't filtered (all are passed through regardless of effect)
- Some CSS styles aren't fully filtered

## Release Notes

All details can be found in the jsonify [CHANGELOG](./CHANGELOG.md)