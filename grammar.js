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
    source_file: ($) => repeat(choice($.comment, $.function)),

    comment: (_) => /\/\/.*\n/,

    function: ($) => seq("function", " ", $.identifier, $.params, $.context),

    params: ($) =>
      seq("(", optional(repeat(seq($.identifier, optional(",")))), ")"),

    identifier: (_) => /[a-zA-Z0-9_]+/,

    const: (_) => /const/,

    return: (_) => /return/,

    context: (_) => /\{.*\}/,
  },
});
