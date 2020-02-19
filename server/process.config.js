const $env = require("@bahatron/env").default;

module.exports = {
    apps: [
        {
            script: "dist/bin/www.js",
            name: "mercurios",
            exec_mode: "cluster",
            max_restarts: 3,
            restart_delay: "5000",
            instances: parseInt($env.get("MERCURIOS_PROCESSES", "0")) || "max",
            watch:
                $env.get("MERCURIOS_ENV", "production") === "production"
                    ? false
                    : ["dist"],
        },
    ],
};
