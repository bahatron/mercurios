const $env = require("@bahatron/env").default;

module.exports = {
    apps: [
        {
            script: "dist/bin/www.js",
            name: "mercurios",
            exec_mode: "cluster",
            max_restarts: 2,
            restart_delay: "2000",
            instances: parseInt($env.get("MERCURIOS_WORKERS", "0")) || "max",
            watch:
                $env.get("MERCURIOS_ENV", "production") === "production"
                    ? false
                    : ["dist"],
        },
    ],
};
