# jsonify

jsonify lets you instantly convert SVG and HTML files to [**Microsoft SharePoint List Formats**](https://aka.ms/spdocs-column-formatting). Right click on an SVG or HTML file and choose `Convert to SP List Format` and a new editor will open with a column format that draws your image. As you make changes to your original file, the format will continue to update. Wowee!

## Features

- Maps all supported attributes and styles
- Automatically converts common shapes _(`rect`, `circle`, `ellipse`, `line`, `polyline`, and `polygon`)_ to paths
- Collapses element groups and other non-visual containers (ie `g`)
- Generated formats are kept in sync with your original file _(until you save or close them)_
- Classes defined in style elements are applied and removed
- Classes only used in selectors or applied directly to elements are maintained
- SPFx style theme token support (instead of `color: white;` use `color: "[theme:white]";` or even `color: "[theme: themePrimary, default: #565748]"`)
- Use formatting expressions as CSS properties and other attribute values

Just open an SVG or HTML file, right click and choose `Convert to SP List Format` to have a new window open with a column format that will render your original file as close as possible.

![jsonify in action](./assets/jsonify.gif)


## Requirements

**None** - However, works great with the [SP Formatter extension](https://marketplace.visualstudio.com/items?itemName=s-kainet.sp-formatter) to enable live previews of your SharePoint List Formats!

HTML files can be fully formed HTML (with a `body` and all that stuff) or just one or more elements sitting around waiting to get formatted.

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

- Linked style sheets are not evaluated

## Release Notes

All details can be found in the jsonify [CHANGELOG](https://marketplace.visualstudio.com/items/theChrisKent.jsonify/changelog)