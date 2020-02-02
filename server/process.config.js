module.exports = {
    apps: [
        {
            name: "mercurios",
            script: "dist/bin/www.js",
            exec_mode: "cluster",
            instances: parseInt(process.env.MERCURIOS_PROCESSES) || "2",
            max_restarts: 3,
            watch:
                process.env.MERCURIOS_ENV === "production" ? false : ["dist"],
        },
    ],
};
