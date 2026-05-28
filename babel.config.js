module.exports = function (api) {
    api.cache(true);

    const disableSupabaseOtelImport = ({ types: t }) => ({
        name: "disable-supabase-otel-import",
        visitor: {
            CallExpression(path, state) {
                const filename = state.file.opts.filename || "";
                if (!filename.includes("@supabase/supabase-js")) return;

                if (path.node.callee.type === "Import") {
                    path.replaceWith(
                        t.callExpression(
                            t.memberExpression(
                                t.callExpression(
                                    t.memberExpression(t.identifier("Promise"), t.identifier("resolve")),
                                    [t.nullLiteral()]
                                ),
                                t.identifier("then")
                            ),
                            [t.arrowFunctionExpression([], t.nullLiteral())]
                        )
                    );
                }
            },
        },
    });
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [disableSupabaseOtelImport],
    };
};
