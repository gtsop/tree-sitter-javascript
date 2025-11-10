/*learSearch

 * @file Javascript grammar
 * @author George Tsopanoglou <gtsop+github@protonmail.com>
 * @license AGPLv3
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "javascript",

  conflicts: ($) => [
    [$._assignment_operation, $.array_binding],
    [$.array_binding, $.expression],
    [$.jsx_name, $.ts_generic],
    [$.function_body, $.literal_object],
    [$._assign_target, $.function_param],
    [$._initializer, $.assign],
    [$.expression, $._callable_expr],
    [$.expression, $.function_param],
    [$.expression, $.call_expr],
    [$.ts_generic, $.jsx_start],
    [$.jsx_start, $.jsx_self],
  ],

  rules: {
    source_file: ($) => optional($._js_context),

    _js_context: ($) =>
      repeat1(
        choice($.statement, $.function, $.keyword, $.ts_generic, $.comment),
      ),

    statement: ($) => seq(choice($.declaration, $.expression), $._semi),

    declaration: ($) => choice($.import, $.variable),

    expression: ($) =>
      choice(
        $.function_arrow_expr,
        $.function_expr,
        $.identifier,
        $.kw_this,
        $.literal_array,
        $.literal_boolean,
        $.literal_null,
        $.literal_numeric,
        $.literal_object,
        $.literal_regex,
        $.literal_string,
        $.parens_expr,
        $.property_expr,
        $.call_expr,
        $._operation,
        $.jsx_expr,
      ),

    _callable_expr: ($) => choice($.identifier, $.property_expr),

    parens_expr: ($) => seq("(", $.expression, ")"),
    property_expr: ($) => seq($.identifier, token("."), $.identifier),
    call_expr: ($) => seq($._callable_expr, $.call_expr_params),
    call_expr_params: ($) =>
      seq("(", optional(repeat(seq($.expression, optional(",")))), ")"),

    literal_array: ($) =>
      seq("[", repeat(seq($.expression, optional(","))), "]"),
    literal_null: (_) => token("null"),
    literal_boolean: ($) => choice($.kw_true, $.kw_false),
    literal_numeric: (_) => token(/[0-9]+/),
    literal_object: ($) =>
      seq(
        "{",
        optional(
          repeat(
            seq(
              choice(
                $.comment,
                seq($.literal_object_key, ":", $.literal_object_value),
                $.literal_object_shorthand,
              ),
              optional(","),
            ),
          ),
        ),
        "}",
      ),
    literal_object_key: ($) => $.identifier,
    literal_object_value: ($) => $.expression,
    literal_object_shorthand: ($) => $.identifier,

    literal_string: ($) =>
      choice($._single_string, $._double_string, $._template_string),

    /************************************************************************
     * DECLARATIONS
     */

    /**
     * Import
     */

    import: ($) =>
      seq($.kw_import, $.import_clause, $.kw_from, $.import_module_specifier),

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
      seq($.kw_function, $.function_name, $.function_params, $.function_body),

    function_expr: ($) =>
      seq($.kw_function, $.function_params, $.function_body),

    function_arrow_expr: ($) =>
      seq(
        $.function_params,
        token("=>"),
        choice($.function_body, $.expression),
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
        seq(
          $.identifier,
          optional($.ts_type_annotation),
          optional($._initializer),
        ),
        seq(token("..."), $.identifier),
      ),

    function_body: ($) => seq(token("{"), optional($._js_context), token("}")),

    /**
     * Variables
     */

    variable: ($) =>
      seq(
        choice($.kw_let, $.kw_const),
        choice($.identifier, $.array_binding),
        optional($.ts_type_annotation),
        optional($._initializer),
      ),

    /************************************************************************
     * Statements
     */

    /**
     * Operations
     */

    _operation: ($) => choice($._comparison_operation, $._assignment_operation),

    _assignment_operation: ($) =>
      choice($.assign, $.assign_add, $.assign_sub, $.assign_mul, $.assign_div),

    assign: ($) => seq($._assign_target, "=", $.expression),
    assign_add: ($) => seq($._assign_target, "+=", $.expression),
    assign_sub: ($) => seq($._assign_target, "-=", $.expression),
    assign_mul: ($) => seq($._assign_target, "*=", $.expression),
    assign_div: ($) => seq($._assign_target, "/=", $.expression),

    _assign_target: ($) =>
      choice($.array_binding, $.identifier, $.property_expr),

    array_binding: ($) =>
      seq(
        "[",
        repeat(
          seq(
            choice(
              seq(optional(token("...")), $.identifier),
              $.assign,
              token(","),
            ),
            optional(","),
          ),
        ),
        "]",
      ),

    _comparison_operation: ($) =>
      choice(
        $.equal,
        $.greater_than,
        $.greater_than_or_equal,
        $.less_than,
        $.less_than_or_equal,
        $.not_equal,
        $.strict_equal,
        $.strict_not_equal,
      ),

    equal: ($) => prec.left(1, seq($.expression, "==", $.expression)),
    greater_than: ($) => prec.left(1, seq($.expression, ">", $.expression)),
    greater_than_or_equal: ($) =>
      prec.left(1, seq($.expression, ">=", $.expression)),
    less_than: ($) => prec.left(1, seq($.expression, "<", $.expression)),
    less_than_or_equal: ($) =>
      prec.left(1, seq($.expression, "<=", $.expression)),
    not_equal: ($) => prec.left(1, seq($.expression, "!=", $.expression)),
    strict_equal: ($) => prec.left(1, seq($.expression, "===", $.expression)),
    strict_not_equal: ($) =>
      prec.left(1, seq($.expression, "!==", $.expression)),

    /*
     * Keywords
     */

    kw_as: (_) => token("as"),
    kw_const: (_) => token("const"),
    kw_false: (_) => token("false"),
    kw_from: (_) => token("from"),
    kw_function: (_) => token("function"),
    kw_import: (_) => token("import"),
    kw_let: (_) => token("let"),
    kw_this: (_) => token("this"),
    kw_true: (_) => token("true"),

    keyword: ($) =>
      token(
        choice(
          "break",
          "case",
          "class",
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

    _initializer: ($) => seq(token("="), $.expression),

    /*
     * RegEx
     */
    // regex literal: cannot start with '/*'

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

    jsx_expr: ($) => $._full_jsx,

    jsx_start: ($) =>
      seq(
        "<",
        optional($.jsx_name),
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

    jsx_name: ($) => token(/[a-zA-Z]*/),

    jsx_self: ($) =>
      seq(
        "<",
        optional($.jsx_name),
        optional(
          repeat(seq($.attribute_name, optional(seq("=", $.attribute_value)))),
        ),
        "/>",
      ),

    jsx_end: ($) => seq("</", optional($.jsx_name), ">"),

    attribute_name: (_) => token(/[a-zA-Z]+/),

    attribute_value: ($) => choice($.literal_string, $._jsx_context),

    _jsx_context: ($) => seq("{", $.expression, "}"),

    text: (_) => /[^<]+/,

    _semi: (_) => ";",

    ts_type_annotation: ($) => seq(":", $._ts_type),

    _ts_type: ($) => choice($.ts_boolean, $.ts_number, $.ts_user_type),

    ts_boolean: (_) => token("boolean"),
    ts_number: (_) => token("number"),

    ts_user_type: ($) =>
      seq(token(/[A-Z][a-zA-Z]+/), optional($._ts_type_arguments)),

    _ts_type_arguments: ($) => seq("<", $.ts_type_param, ">"),

    ts_type_param: ($) => choice($.ts_user_type),

    /*****
    THE HARD ONES
    */

    /*
     * Comments
     */
    comment: ($) => choice($._multi_comment, $._single_comment),

    _multi_comment: (_) => seq("/*", token(/([^*]|\*[^/])*/), "*/"),
    _single_comment: (_) => token(/\/\/.*\n/),

    literal_regex: ($) =>
      token(
        prec(
          1,
          seq(
            "/",
            // Disallow starting a comment
            token.immediate(/[^*/\n]/), // first char isn't '*' or '/' or newline
            // The rest can be: normal chunks (no '/', '[', '\n', '\'),
            // escapes, or a full character class that itself allows '/'
            repeat(
              choice(
                /[^/\n\\\[]+/, // plain chunk
                /\\./, // escape
                seq(
                  // character class [...]
                  "[",
                  repeat(choice(/[^]\n\\]/, /\\./)), // everything but ']' or escaped
                  "]",
                ),
              ),
            ),
            "/",
            optional(/[A-Za-z]+/), // flags (be permissive; JS has gimsuydv etc.)
          ),
        ),
      ),
  },
});
