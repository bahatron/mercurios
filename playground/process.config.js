const logsCommon = {
    out_file: "/dev/null",
    error_file: "/dev/null",
};

module.exports = {
    apps: [
        {
            ...logsCommon,
            name: "playground",
            // script: "dist/playground/server.js",
            // script: "playground/src/server.ts",
            script: "src/server.ts",
            autorestart: false,
            watch: true,
            exec_mode: "cluster",
            instances: "3",
        },
    ],
};
