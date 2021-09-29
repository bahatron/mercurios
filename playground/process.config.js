const logsCommon = {
    out_file: "/dev/null",
    error_file: "/dev/null",
};

module.exports = {
    apps: [
        {
            ...logsCommon,
            name: "playground",
            script: "dist/server.js",
            autorestart: false,
            watch: ["dist", "../client/lib"],
            exec_mode: "cluster",
            instances: "max"
        },
    ],
};
