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

/**
 * constants
 */
const TILT_COMPOSE = "docker-compose.tilt.yml";

/**
 * flags
 */
const hasCleanFlags = () => argsContains(["-c", "--clean"]);

/**
 * command handlers
 */
if (argsContains("setup")) {
    if (hasCleanFlags()) {
        exec(`find . -name "node_modules" -type d -prune -exec rm -rf '{}' +`);
        exec("npx lerna clean -y");
    }

    exec("npm install");
    exec(`npm run bootstrap`);
}

function shutDown() {
    exec(`docker-compose -f ${TILT_COMPOSE} down --remove-orphans --volumes`);
}

function runTilt() {
    if (hasCleanFlags()) {
        shutDown();
    }

    exec(`tilt up --hud -f Tiltfile`);
    shutDown();
}

function runCompose() {
    if (hasCleanFlags()) {
        shutDown();
    }

    exec(`docker-compose up --build --abort-on-container-exit`);
}

function runTest() {
    if (hasCleanFlags()) {
        shutDown();
    }

    exec(`./scripts/test.sh`);
}

/**
 * main
 */
if (argsContains("down")) {
    shutDown();
    exit(0);
} else if (argsContains("tilt")) {
    runTilt();
    exit(0);
} else if (argsContains("dev")) {
    runCompose();
    exit(0);
} else if (argsContains("test")) {
    runTest();
    exit(0);
} else {
    exit(0);
}
