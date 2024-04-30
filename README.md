# jsonify

jsonify lets you instantly convert HTML and SVG files to [**Microsoft SharePoint List Formats**](https://aka.ms/spdocs-column-formatting). Right click on an SVG or HTML file and choose `Convert to SP List Format` and a new editor will open with a column format that draws your image. As you make changes to your original file, the format will continue to update. Wowee!

jsonify also extends the definition of JSON to inject support for HorseScript syntax highlighting (list formatting expressions). This means your expressions get true syntax highlighting even when written as JSON properties. Additional Wowee!

## Features

### Syntax Highlighting

![jsonify syntax highlighting](./assets/jsonify%20Syntax%20Highlighting.gif)

#### HTML to Format

![jsonify HTML to Format](./assets/jsonify%20HTML%20to%20Format.gif)


#### SVG to Format

![jsonify in action](./assets/jsonify%20SVG%20to%20Format.gif)

#### Details

- Syntax highlighting of expressions
- Maps all supported attributes and styles
- Automatically converts common SVG shape elements _(`rect`, `circle`, `ellipse`, `line`, `polyline`, and `polygon`)_ to paths
- Collapses SVG element groups and other non-visual containers (ie `g`)
- Generated formats are kept in sync with your original file _(until you save or close them)_
- Classes defined in style elements are applied and removed
- Classes only used in selectors or applied directly to elements are maintained
- SPFx style theme token support (instead of `color: white;` use `color: "[theme:white]";`)
- Use formatting expressions as CSS properties and other attribute values
- Warrior Horse Theme (Dark)

Just open an SVG or HTML file, right click and choose `Convert to SP List Format` to have a new window open with a column format that will render your original file as close as possible.

Changes to your original will continue to show up in the generated format! Saving the format file will disconnect the live updates.


## Requirements

**None** - However, works great with the [SP Formatter extension](https://marketplace.visualstudio.com/items?itemName=s-kainet.sp-formatter) to enable live previews of your SharePoint List Formats!

HTML files can be fully formed HTML (with a `body` and all that stuff) or just one or more elements sitting around waiting to get formatted. Inline styles and style tags are fully supported (linked stylesheets are not).

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

- Linked style sheets are not evaluated
- Horsescript definition provides syntax highlighting only, not autocomplete or error checking

## Release Notes

All details can be found in the jsonify [CHANGELOG](https://marketplace.visualstudio.com/items/theChrisKent.jsonify/changelog)