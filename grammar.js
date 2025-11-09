/**
 * @file Javascript grammar
 * @author George Tsopanoglou <gtsop+github@protonmail.com>
 * @license AGPLv3
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "javascript",

  conflicts: ($) => [
    [$.ts_generic, $.jsx_start],
    [$.jsx_start, $.jsx_self],
  ],

  rules: {
    source_file: ($) => optional($._js_context),

    _js_context: ($) =>
      repeat1(
        choice(
          $.declaration,
          // $.statement,
          $.string,
          $.comment,
          $.keyword,
          $.regex,
          $.identifier,
          $._full_jsx,
          $.ts_generic,
        ),
      ),

    declaration: ($) => choice($.import, $.function, $.variable),

    /************************************************************************
     * DECLARATIONS
     */

    /**
     * Import
     */

    import: ($) =>
      seq(
        $.kw_import,
        $.import_clause,
        $.kw_from,
        $.import_module_specifier,
        $._semi,
      ),

    import_clause: ($) =>
      repeat1(
        seq(
          choice(
            $._import_clause_default,
            $._import_namespace,
            $._import_clause_named_imports,
          ),
          optional(","),
        ),
      ),

    _import_clause_named_imports: ($) =>
      seq(
        "{",
        repeat(
          seq(choice($.import_name, $._import_clause_alias), optional(",")),
        ),
        "}",
      ),

    _import_clause_default: ($) => $.import_name,

    _import_namespace: ($) => seq($.import_namespace, $.kw_as, $.import_name),

    _import_clause_alias: ($) =>
      seq(choice($.identifier, $.string), $.kw_as, $.import_name),

    import_name: ($) => $.identifier,
    import_namespace: (_) => token("*"),
    import_module_specifier: ($) => $.string,

    /**
     * Function
     */

    function: ($) =>
      seq(
        $.kw_function,
        optional($.function_name),
        $.function_params,
        $.function_body,
      ),

    function_name: ($) => $.identifier,

    function_params: ($) =>
      seq(
        token("("),
        optional(repeat(seq($.function_param, optional(token(","))))),
        token(")"),
      ),

    function_param: ($) =>
      choice(
        seq($.identifier, optional(seq(token("="), $.initializer))),
        seq(token("..."), $.identifier),
      ),

    function_body: ($) => seq(token("{"), token("}")),

    /**
     * Variables
     */

    variable: ($) => seq($.kw_let, $.identifier, $._semi),

    /************************************************************************
     * Statements
     */

    /*
     * Comments
     */
    comment: ($) => choice($._multi_comment, $._single_comment),

    _multi_comment: (_) => seq("/*", token(/([^*]|\*[^/])*/), "*/"),
    _single_comment: (_) => token(/\/\/.*\n/),

    /*
     * Keywords
     */

    kw_as: (_) => token("as"),
    kw_from: (_) => token("from"),
    kw_function: (_) => token("function"),
    kw_import: (_) => token("import"),
    kw_let: (_) => token("let"),

    keyword: ($) =>
      token(
        choice(
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
          "if",
          "in",
          "interface",
          "keyof",
          "new",
          "of",
          "return",
          "switch",
          "type",
          "var",
          "while",
        ),
      ),

    identifier: (_) => token(/[A-Za-z_$][A-Za-z0-9_$]*/),

    initializer: ($) => choice($.dt_number),

    dt_number: ($) => token(/[0-9]+/),

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

    /*
     * JSX
     */

    ts_generic: (_) => seq("<", /[a-zA-Z]*/, ">"),

    jsx_start: ($) =>
      seq(
        "<",
        optional(/[a-zA-Z]*/),
        optional(
          repeat(seq($.attribute_name, optional(seq("=", $.attribute_value)))),
        ),
        ">",
      ),

    _full_jsx: ($) =>
      choice(
        seq(
          $.jsx_start,
          optional(repeat(choice($.text, $._full_jsx, $.comment))),
          $.jsx_end,
        ),
        $.jsx_self,
      ),

    jsx_self: ($) =>
      seq(
        "<",
        optional(/[a-zA-Z]*/),
        optional(
          repeat(seq($.attribute_name, optional(seq("=", $.attribute_value)))),
        ),
        "/>",
      ),

    jsx_end: (_) => seq("</", optional(/[a-zA-Z]+/), ">"),

    attribute_name: (_) => token(/[a-zA-Z]+/),

    attribute_value: ($) => choice(seq('"', /[a-z]+/, '"'), $.jsx_context),

    jsx_context: ($) => seq("{", $._js_context, "}"),

    text: (_) => /[^<]+/,

    _semi: (_) => ";",
  },
});

