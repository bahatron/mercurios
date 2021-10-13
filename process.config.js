const logsCommon = {
    out_file: "/dev/null",
    error_file: "/dev/null",
};

module.exports = {
    apps: [
        {
            ...logsCommon,
            name: "playground",
            script: "playground/src/server.ts",
            autorestart: false,
            watch: ["."],
            exec_mode: "cluster",
            instances: "3",
        },
    ],
};
