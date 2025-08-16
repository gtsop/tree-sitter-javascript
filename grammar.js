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
    source_file: ($) =>
      repeat(
        choice(
          $.string,
          $.comment,
          $.function,
          $.var,
          $.let,
          $.const,
          $.identifier,
          $.semi,
        ),
      ),

    comment: (_) => /\/\/.*\n/,

    function: ($) => seq("function", " ", $.identifier, $.params, $.context),

    params: ($) =>
      seq("(", optional(repeat(seq($.identifier, optional(",")))), ")"),

    const: (_) => /const/,

    return: (_) => /return/,

    context: (_) => /\{.*\}/,

    var: ($) => seq("var", " ", $.identifier),
    let: ($) => seq("let", " ", $.identifier),
    const: ($) => seq("const", " ", $.identifier),
    semi: (_) => /;/,

    identifier: (_) => /[a-zA-Z0-9_]+/,

    /*
     * Strings
     */
    string: ($) =>
      choice($._single_string, $._double_string, $._template_string),

    _single_string: (_) => seq("'", /[^']*/, "'"),
    _double_string: (_) => seq('"', /[^"]*/, '"'),
    _template_string: (_) => seq("`", /[^`]*/, "`"),
  },
});
