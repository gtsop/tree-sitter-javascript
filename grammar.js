/**
 * @file Javascript grammar
 * @author George Tsopanoglou <gtsop+github@protonmail.com>
 * @license AGPLv3
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "javascript",

  rules: {
    // TODO: add the actual grammar rules
    source_file: ($) => choice($.comment),

    comment: (_) => /\/\/.*\n/,
  },
});
