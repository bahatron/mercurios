module.exports = {
    apps: [
        {
            script: "dist/bin/www.js",
            name: "mercurios",
            exec_mode: "cluster",
            max_restarts: 3,
            restart_delay: "5000",
            instances: parseInt(process.env.MERCURIOS_PROCESSES) || "2",
            watch:
                process.env.MERCURIOS_ENV === "production" ? false : ["dist"],
        },
    ],
};
