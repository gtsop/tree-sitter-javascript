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
    [$.ternary_test, $.ternary_alternate],
    [$.assign_div, $.ternary_test],
    [$.assign_mul, $.ternary_test],
    [$.assign_sub, $.ternary_test],
    [$.assign_add, $.ternary_test],
    [$.assign, $.ternary_test],
    [$.ternary_test, $.function_arrow_expr],
    [$.ts_array, $.ts_function_return],
    [$.array_binding, $.literal_array],
    [$.object_binding, $.literal_object],
    [$.function_param, $._assignment_operation],
    [$.bind_as, $.literal_object_key],
    [$.object_binding, $.literal_object_shorthand],
    [$._assignment_operation, $.array_binding],
    [$.array_binding, $.expression],
    [$.function_body, $.literal_object],
    [$._assign_target, $.function_param],
    [$._initializer, $.assign],
    [$.expression, $._callable_expr],
    [$.expression, $.function_param],
    [$.expression, $.call_expr],
    [$.jsx_start, $.jsx_self],
  ],

  rules: {
    source_file: ($) => optional($._js_context),

    _js_context: ($) =>
      repeat1(
        choice($.statement, $.function, $.ts_interface, $.keyword, $.comment),
      ),

    statement: ($) =>
      choice(seq(choice($.declaration, $.expression), $._semi), $.if),

    declaration: ($) => choice($.import, $.variable, $.ts_type_alias),

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
        $.ts_as,
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
      seq(
        $.kw_function,
        $.function_name,
        optional($.ts_generic),
        $.function_params,
        $.function_body,
      ),

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
        $.object_binding,
        $.array_binding,
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

    if: ($) =>
      prec.left(
        1,
        seq($.kw_if, $.if_test, $.consequent, optional($.alternate)),
      ),

    alternate: ($) => seq($.kw_else, choice($.if, $.block_statement)),

    if_test: ($) => seq("(", $.expression, ")"),

    consequent: ($) => choice($.statement, $.block_statement),

    block_statement: ($) => seq("{", repeat1($.statement), "}"),

    /**
     * Operations
     */

    _operation: ($) =>
      choice(
        $._comparison_operation,
        $._assignment_operation,
        $._logical_operation,
        $._ternary_operation,
      ),

    _assignment_operation: ($) =>
      choice($.assign, $.assign_add, $.assign_sub, $.assign_mul, $.assign_div),

    assign: ($) => seq($._assign_target, "=", $.expression),
    assign_add: ($) => seq($._assign_target, "+=", $.expression),
    assign_sub: ($) => seq($._assign_target, "-=", $.expression),
    assign_mul: ($) => seq($._assign_target, "*=", $.expression),
    assign_div: ($) => seq($._assign_target, "/=", $.expression),

    _assign_target: ($) =>
      choice($.array_binding, $.object_binding, $.identifier, $.property_expr),

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

    object_binding: ($) =>
      seq(
        "{",
        repeat(
          seq(
            choice(
              seq(optional(token("...")), $.identifier),
              $.identifier,
              $.bind_as,
              $.assign,
            ),
            optional(","),
          ),
        ),
        "}",
      ),

    bind_as: ($) => seq($.identifier, ":", choice($.identifier, $.assign)),

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

    _logical_operation: ($) => choice($.or, $.and, $.not),

    or: ($) => prec.left(1, seq($.expression, "||", $.expression)),
    and: ($) => prec.left(1, seq($.expression, "&&", $.expression)),
    not: ($) => prec.left(1, seq("!", $.expression)),

    _ternary_operation: ($) => $.ternary,

    ternary: ($) =>
      seq($.ternary_test, "?", $.ternary_consequent, ":", $.ternary_alternate),

    ternary_test: ($) => $.expression,

    ternary_consequent: ($) => $.expression,

    ternary_alternate: ($) => $.expression,
    /*
     * Keywords
     */

    kw_as: (_) => token("as"),
    kw_const: (_) => token("const"),
    kw_else: (_) => token("else"),
    kw_false: (_) => token("false"),
    kw_from: (_) => token("from"),
    kw_function: (_) => token("function"),
    kw_if: (_) => token("if"),
    kw_import: (_) => token("import"),
    kw_interface: (_) => token("interface"),
    kw_let: (_) => token("let"),
    kw_this: (_) => token("this"),
    kw_true: (_) => token("true"),
    kw_type: (_) => token("type"),

    keyword: ($) =>
      token(
        choice(
          "break",
          "case",
          "class",
          "continue",
          "default",
          "delete",
          "export",
          "extends",
          "for",
          "in",
          "keyof",
          "new",
          "of",
          "return",
          "switch",
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

    ts_generic: ($) => seq("<", repeat1(seq($._ts_type, optional(","))), ">"),

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

    ts_type_annotation: ($) => seq(optional("?"), ":", $._ts_type),

    _ts_type: ($) =>
      choice(
        $.ts_any,
        $.ts_array,
        $.ts_bigint,
        $.ts_boolean,
        $.ts_function,
        $.ts_literal,
        $.ts_null,
        $.ts_number,
        $.ts_object,
        $.ts_string,
        $.ts_tuple,
        $.ts_undefined,
        $.ts_union,
        $.ts_user_type,
        $.ts_void,
      ),

    ts_any: (_) => token("any"),
    ts_array: ($) => seq(choice($._ts_type, seq("(", $._ts_type, ")")), "[]"),
    ts_bigint: (_) => token("bigint"),
    ts_boolean: (_) => token("boolean"),
    ts_function: ($) =>
      seq($.ts_function_params, token("=>"), $.ts_function_return),
    ts_literal: ($) => $.literal_string,
    ts_null: (_) => token("null"),
    ts_number: (_) => token("number"),
    ts_object: ($) =>
      seq(
        "{",
        repeat1(seq($.ts_object_property, $.ts_type_annotation, optional(";"))),
        "}",
      ),
    ts_object_property: ($) => $.identifier,
    ts_string: (_) => token("string"),
    ts_tuple: ($) => seq("[", repeat1(seq($._ts_type, optional(","))), "]"),
    ts_undefined: (_) => token("undefined"),
    ts_union: ($) => prec.left(1, seq($._ts_type, "|", $._ts_type)),
    ts_void: ($) => token("void"),

    ts_user_type: ($) =>
      prec.left(
        1,
        seq(
          token(/[A-Z][a-zA-Z]+/),
          optional(choice($.ts_generic, $.ts_index_access)),
        ),
      ),

    ts_function_params: ($) => seq("(", repeat($.ts_function_param), ")"),
    ts_function_param: ($) => seq($.identifier, $.ts_type_annotation),
    ts_function_return: ($) => $._ts_type,

    ts_type_alias: ($) => seq($.kw_type, $.identifier, "=", $._ts_type),

    ts_type_param: ($) => choice($.ts_user_type),

    ts_interface: ($) => seq($.kw_interface, $.identifier, $.ts_object),

    ts_as: ($) => prec(1, seq($.expression, $.kw_as, $._ts_type)),

    ts_index_access: ($) => seq("[", $._ts_type, "]"),

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
