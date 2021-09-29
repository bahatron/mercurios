#!/usr/bin/node
const { execSync } = require("child_process");
const argv = process.argv.slice(2);
const exec = (command, env) => execSync(command, { stdio: [0, 1, 2], env });
const exit = (code) => process.exit(code);
const argsContains = (flag) => {
    return Array.isArray(flag)
        ? argv.some((item) => flag.includes(item))
        : argv.includes(flag);
};

function shutDown() {
    exec(`docker-compose down --remove-orphans --volumes`);
}

/**
 * main
 */
if (argsContains("setup")) {
    exec(`find . -name "node_modules" -type d -prune -exec rm -rf '{}' +`);
    exec("npm install");
} else if (argsContains("down")) {
    shutDown();
} else if (argsContains(["tilt"])) {
    shutDown();
    exec(`tilt up --hud -f Tiltfile`);
    shutDown();
} else if (argsContains("dc")) {
    shutDown();
    exec(`docker-compose up --build --abort-on-container-exit`);
    shutDown();
}

exit(0);
