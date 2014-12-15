# grunt-templates2js

> Converts html templates to JavaScript

This is a fork of the [grunt-html-convert repo](https://github.com/soundstep/grunt-html-convert). This fork convert html to vanilla javascript, adding new features.

## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-templates2js --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-templates2js');
```

## The "templates2js" task

### Overview

This plugin converts a group of html files to JavaScript and assembles them into an vanilla javascript.

Note that this plugin does *not* compile the templates.  It simply caches the template source code.

### Setup

```js
grunt.initConfig({
  templates2js: {
    options: {
      // custom options, see below    
    },
    mytemplate: {
      src: ['src/**/*.tpl.html'],
      dest: 'tmp/templates.js'
    },
  },
})
```

Result:

```
var mytemplate = {};
mytemplate['tile-item.tpl.html'] = '<div data-id="{{data.id}}">\n' +
	'	{{data.title}}\n' +
	'	<img data-src="{{data.img}}" />\n' +
	'	<button data-click="remove()"></button>\n' +
	'</div>';
```

Note that you should use relative paths to specify the template URL, to
match the keys by which the template source is cached.

### Gotchas

The `dest` property must be a string.  If it is an array, Grunt will fail when attempting to write the bundle file.

### Options

#### options.base
Type: `String`
Default value: `'src'`

The prefix relative to the project directory that should be stripped from each template path to produce a module identifier for the template.  For example, a template located at `src/projects/projects.tpl.html` would be identified as just `projects/projects.tpl.html`.

#### options.target
Type: `String`
Default value: `'js'`

Language of the output file. Possible values: `'coffee'`, `'js'`.

#### options.module
Type: `String`
Default value: the task name

#### options.rename
Type: `Function`
Default value: `none`

A function that takes in the module identifier and returns the renamed module identifier to use instead for the template.  For example, a template located at `src/projects/projects.tpl.html` would be identified as `/src/projects/projects.tpl` with a rename function defined as:

```
function (moduleName) {
  return '/' + moduleName.replace('.html', '');
}
```

#### options.quoteChar
Type: `Character`
Default value: `"`

Strings are quoted with double-quotes by default.  However, for projects 
that want strict single quote-only usage, you can specify:

```
options: { quoteChar: '\'' }
```

to use single quotes, or any other odd quoting character you want

#### indentString
Type: `String`
Default value: `    `

By default a tab indent is used for the generated code. However,
you can specify alternate indenting via:

```
options: { indentString: '    ' }
```

#### indentGlobal
Type: `String`
Default value: ``

By default there's global indentation. However, if all the generated code must indented,
you can specify it via:

```
options: { indentGlobal: '    ' }
```

#### fileHeaderString:
Type: `String`
Default value: ``

If specified, this string  will get written at the top of the output
Template.js file. As an example, jshint directives such as
/* global soma: false */ can be put at the head of the file.

#### htmlmin:
Type: `Object`
Default value: {}

Minifies HTML using [html-minifier](https://github.com/kangax/html-minifier).

```
options: {
  htmlmin: {
    collapseBooleanAttributes: true,
    collapseWhitespace: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true
  }
}
```

#### process:
Type: `Object` or `Boolean` or `Function`
Default value: `false`

Performs arbitrary processing on the template as part of the compilation process.

Option value can be one of:

1. a function that accepts `content` and `filepath` as arguments, and returns the transformed content
2. an object that is passed as the second options argument to `grunt.template.process` (with the file content as the first argument)
3.  `true` to call `grunt.template.process` with the content and no options

### Usage Examples

See the `Gruntfile.js` in the project source code for various configuration examples.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

0.0.1 adding html-minifier support
