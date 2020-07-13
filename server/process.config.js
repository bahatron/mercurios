module.exports = {
    apps: [
        {
            script: "dist/bin/http_server.js",
            name: "mercurios",
            exec_mode: "cluster",
            restart_delay: "1000",
            instances: process.env.MERCURIOS_WORKERS || 0,
            watch:
                process.env.MERCURIOS_ENV === "production" ? false : ["dist"],
            autorestart: process.env.MERCURIOS_ENV === "production",
            out_file: "/dev/null",
            error_file: "/dev/null",
        },
    ],
};
