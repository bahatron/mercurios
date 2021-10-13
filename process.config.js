const logsCommon = {
    out_file: "/dev/null",
    error_file: "/dev/null",
};

module.exports = {
    apps: [
        {
            ...logsCommon,
            name: "playground",
            script: "playground/server.ts",
            watch: ["src", "playground"],
            autorestart: false,
            exec_mode: "cluster",
            instances: "3",
        },
    ],
};
