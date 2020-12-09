let isProd = process.env.MERCURIOS_ENV === "production";

module.exports = {
    apps: [
        {
            script: "dist/bin/mercurios-server.js",
            name: "mercurios",
            exec_mode: "cluster",
            instances: process.env.MERCURIOS_WORKERS || 0,
            watch: isProd ? false : ["dist"],
            autorestart: isProd,
            out_file: "/dev/null",
            error_file: "/dev/null",
            node_args: isProd ? undefined : ["--inspect=0.0.0.0:9230"],
        },
    ],
};
