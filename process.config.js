module.exports = {
    apps: [
        {
            name: "playground",
            script: "lib/playground/server.js",
            watch: ["src", "playground"],
            autorestart: false,
            exec_mode: "cluster",
            instances: "3",
            out_file: "/dev/null",
            error_file: "/dev/null",
        },
    ],
};
