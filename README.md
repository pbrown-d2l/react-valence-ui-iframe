# react-valence-ui-iframe

A wrapper for the iframe which provides callbacks for various purposes

## Props

- `src`: the src that you want to provide to the iframe
- `resizeCallback`: A function which gets called whenever the iframe's height is calculated
- `progressCallback`: A function which gets called whenever the iframe starts or finishes loading.

## Callbacks

```
resizeCallback ( size, sizeKnown )
```
- A callback reporting on the size of the iframe's contents. Provided in the same format as the `react-valence-ui-fileviewer`'s `resizeCallback`.

`size`
- A value for the size of the iframe if we can figure it out.
- Null if the size is not known.

`sizeKnown`
- True if the size is known.
- False if the size is not known.

```
progressCallback ( progress, accuracy )
```
- A callback providing information on whether the iframe has loaded or not. Provided in the same format as the `react-valence-ui-fileviewer`'s `progressCallback`.

`progress`
- 0 if the iframe has not loaded yet.
- 100 if the iframe is loaded

`accuracy`
- `'none'`, because it doesn't provide values than 0 and 100

## Usage Example:

- https://github.com/Brightspace/activity-viewer

**Note:** Iframe Brightspace pages that contain a navbar and/or minbar (such as quizzes and surveys) will have these removed in the ResizingIframe.
