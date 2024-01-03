# Web Component : virtual-list

Virtual list web component for creating selection lists with a large number of lines. The basic principle is to render the rows currently visible.

## Install

```
$ npm i --save vlist
```

## Import

```js
import 'virtual-list'
```

## Usage

This custom element extends the div tag.

```html
<div is="virtual-list"></div>
```

This package doesn't contain any CSS style files, but you can take inspiration from this basic example.

```css
[is='virtual-list'] {
    overflow-y: auto;
    height: 200px;

    > ul {
        position: relative;
        margin: 0;
        padding: 0;

        > li {
            position: absolute;
            display: flex;
            align-items: center;
            padding-inline: 5px;
            white-space: nowrap;
            cursor: pointer;
            width: 100%;
            overflow: hidden;

            &:hover {
                background-color: #eee;
            }

            &.selected {
                background-color: #333;
                color: #fff;
            }
        }
    }
}
```

Finally, add some code :

```js
const div = document.querySelector('div')

// assign an array to `items` property to populate the list
div.items = ['item 1', 'item 2', ...]

// item height must be controlled by this property
div.itemHeight = 35 // in px, default to 22

// then listen to selection
div.addEventListener('input', () => console.log(div.items[div.selected]))
```

You can modify the row template :

```js
// define the template, it must be a function, returning a string
div.template = ({ initials, title, num }) =>
    `<b>${initials}</b><div>${title}</div><em>${num}</em>`

// and set corresponding items
div.items = [
    {
        initials: 'DE',
        title: 'gima ki dary delikuca',
        num: 27
    },
    ...
]
```
