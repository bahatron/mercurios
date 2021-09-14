const logsCommon = {
    out_file: "/dev/null",
    error_file: "/dev/null",
};


module.exports = {
    apps: [
        {
            ...logsCommon,
            name: "playground",
            script: "dist/index.js",
            autorestart: false,
            watch: ["dist"],
        },
    ],
};