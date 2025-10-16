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
    source_file: ($) =>
      repeat(choice($.string, $.comment, $.keyword, $.regex, $.identifier)),

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
      token(
        choice(
          "as",
          "break",
          "case",
          "class",
          "const",
          "continue",
          "default",
          "delete",
          "else",
          "export",
          "extends",
          "for",
          "from",
          "function",
          "if",
          "import",
          "in",
          "interface",
          "keyof",
          "let",
          "new",
          "of",
          "return",
          "switch",
          "type",
          "var",
          "while",
        ),
      ),

    identifier: (_) => token(/[a-zA-Z0-9_]+/),

    /*
     * RegEx
     */
    // regex literal: cannot start with '/*'
    regex: ($) =>
      token(
        prec(
          1,
          seq(
            "/",
            // first char: not '*', '/', '\n' (or allow escaped)
            choice(/[^*/\n\\]/, /\\./),
            // rest
            repeat(choice(/[^/\n\\]/, /\\./)),
            "/",
            optional(/[a-zA-Z]+/),
          ),
        ),
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

