![](https://badgen.net/badge/Editor.js/v2.0/blue)

# Simple Audio Tool

Provides Audio Blocks for the [Editor.js](https://editorjs.io).

Works only with pasted audio URLs and requires no server-side uploader.

![](assets/audio-uploading.gif)

## Installation

### Install via NPM

Get the package

```shell
npm i --save-dev @editorjs/simple-audio
```

Include module at your application

```javascript
const SimpleAudio = require('@editorjs/simple-audio');
```

### Download to your project's source dir

1. Upload folder `dist` from repository
2. Add `dist/bundle.js` file to your page.

### Load from CDN

You can load specific version of package from [jsDelivr CDN](https://www.jsdelivr.com/package/npm/@editorjs/simple-audio).

`https://cdn.jsdelivr.net/npm/@editorjs/simple-audio@latest`

Then require this script on page with Editor.js.

```html
<script src="..."></script>
```

## Usage

Add a new Tool to the `tools` property of the Editor.js initial config.

```javascript
var editor = EditorJS({
  ...

  tools: {
    ...
    audio: SimpleAudio,
  }

  ...
});
```

## Config Params

This Tool has no config params

## Tool's settings

![](https://capella.pics/c74cdeec-3405-48ac-a960-f784188cf9b4.jpg)

1. Add border

2. Stretch to full-width

3. Add background

## Output data

| Field          | Type      | Description                     |
| -------------- | --------- | ------------------------------- |
| url            | `string`  | audio's url                     |
| caption        | `string`  | audio's caption                 |
| withBorder     | `boolean` | add border to audio             |
| withBackground | `boolean` | need to add background          |
| stretched      | `boolean` | stretch audio to screen's width |


```json
{
    "type" : "audio",
    "data" : {
        "url" : "https://www.tesla.com/tesla_theme/assets/img/_vehicle_redesign/roadster_and_semi/roadster/hero.jpg",
        "caption" : "Roadster // tesla.com",
        "withBorder" : false,
        "withBackground" : false,
        "stretched" : true
    }
}
```
