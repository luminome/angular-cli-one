export const z = `
.ez-dom {
    background-color: darkcyan;
    display: block;
    position: relative;
    overflow: hidden;
    height:auto;
    color: cyan;
}

.ez-field {
    outline: none;
    border: 0;
    background-color: rgba(255,255,255,0.15);
    font-size: inherit;
    line-height: inherit;
    color:inherit;
    resize: none;
    overflow-y: scroll;
    box-sizing: border-box;
    display: block;
    position: absolute;
    left:32px;
    right:0;
    margin: 0;
    padding: 0 4px;
    white-space: pre;
    tab-size: 12px;
}


.ez-lines {
    font-size: inherit;
    line-height: inherit;
    font-family: monospace;
    font-weight: bold;
    background-color: rgba(0,0,0,0.25);
    color:inherit;
    margin: 0;
    position: absolute;
    display: block;
    overflow-y: scroll;
    left:0;
    top:0;
    right:0;
}

.ez-lines div {
    padding: 0 4px;
    opacity: 0.74;
    background-color: inherit;
}

.ez-lines::-webkit-scrollbar, .ez-field::-webkit-scrollbar {
    display: none;
}

.ez-lines div:nth-child(even) {
    background-color: initial;
}

.ez-info {
    color:inherit;
    font-size: inherit;
    opacity: 0.5;
    line-height: inherit;
    font-family: monospace;
    position: absolute;
    top:0;
    right:4px;
}

.ez-content {
    position: absolute;
    background-color: rgba(255,255,255,0.25);
    height:16px;
    top:0;
    left:0;
    right:0;
}

`