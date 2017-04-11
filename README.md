## Getting Started
Why another grid? So the way we talk about the grid, is the same way we code the grid. [Check out the demo](https://argyleink.github.io/ragrid/). None of this `xs-col-5` or `IbBox W(1/3)` or whatever is in fashion, let's use the same speak we do with people, with our machines.

**This grid is a bit different, here's why:**
* Columns and rows are intrinsicly sized by default, so they rag like typography (RAGrid.. get it..)
* It uses the Adobe/Sketch align tool lingo for inspiration
* Layout is done via attributes instead of classes
* It offers a strong 12-column base, even though it's trying to inspire you out of extrinsic grid sizing
* It's not solving everything for you. You'll be bringing your own media queries
* It's small, you could copy paste it if you wanted
* No polyfills included, up to your stack to do something if flexbox isn't supported

**tldr;** easy to talk about set of flexbox grid attributes that opts for the grid items to determine their own size instead of the columns telling them what to be. Be node minimal, move children like designers do layers, and be a box boss. Alignment and distribution are far more powerful than offsets, gutters, and specific column sizes.


```shell
npm install ragrid --save-dev
# or
yarn add ragrid
```



### Build
If you are cloning this repo, 2 npm scripts are available for ya:

```shell
npm run ragrid # no watch, just convert the stylus
npm run crunch # minify css file for open source use
```


## Contributing
Make a PR =)

## Release History
* 2017-4-09  v1.0.0  Make it easy to use

## License
Copyright (c) 2017 Adam Argyle. Licensed under the MIT license.