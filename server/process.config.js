const $env = require("@bahatron/env").default;

module.exports = {
    apps: [
        {
            script: "dist/bin/www.js",
            name: "mercurios",
            exec_mode: "cluster",
            restart_delay: "1000",
            instances: parseInt($env.get("MERCURIOS_WORKERS", "0")) || "max",
            watch:
                $env.get("MERCURIOS_ENV", "production") === "production"
                    ? false
                    : ["dist"],
        },
    ],
};
