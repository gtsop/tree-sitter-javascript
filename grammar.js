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
    source_file: ($) => repeat(choice($.string, $.comment, $.keyword)),

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
     * Comments
     */
    comment: ($) => choice($._multi_comment, $._single_comment),

    _multi_comment: (_) => seq("/*", token(/([^*]|\*[^/])*/), "*/"),
    _single_comment: (_) => token(/\/\/.*\n/),

    /*
     * Keywords
     */

    keyword: ($) =>
      choice(
        "break",
        "case",
        "class",
        "const",
        "continue",
        "default",
        "delete",
        "else",
        "for",
        "function",
        "if",
        "in",
        "let",
        "new",
        "of",
        "return",
        "switch",
        "var",
        "while",
      ),

    /*
     * Strings
     */
    string: ($) =>
      choice($._single_string, $._double_string, $._template_string),

    _single_string: (_) => seq("'", token(/[^']*/), "'"),
    _double_string: (_) => seq('"', token(/([^"]|\\.)*/), '"'),
    _template_string: (_) => seq("`", token(/[^`]*/), "`"),
  },
});
