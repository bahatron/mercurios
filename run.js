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
const DEV_COMPOSE = "docker-compose.dev.yml";

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
    exit(0);
}

function shutDown() {
    // exec(`test $(command -v tilt) && tilt down`);
    exec(`docker-compose -f ${DEV_COMPOSE} down --remove-orphans --volumes`);
}

function runDev() {
    if (hasCleanFlags()) {
        shutDown();
    }

    let services = [`mercurios-client`, `mercurios-playground`];

    if (argsContains(["--pg"])) {
        services = [...services, "mercurios-postgres"];
        exec(` tilt up --hud=true ${services.join(" ")}`, {
            MERCURIOS_STORE: "pg",
        });
    } else if (argsContains(["--mongo"])) {
        services = [...services, "mercurios-mongo"];
        exec(`tilt up --hud=true ${services.join(" ")}`, {
            MERCURIOS_STORE: "mongo",
        });
    } else {
        services = [...services, "mercurios-mysql"];
        exec(`tilt up --hud=true ${services.join(" ")}`, {
            MERCURIOS_STORE: "mysql",
        });
    }

    shutDown();
    exit(0);
}

function runTest() {
    if (hasCleanFlags()) {
        shutDown();
    }

    exec(`./scripts/test.sh`);
    exit(0);
}

/**
 * main
 */
if (argsContains("setup")) {
    runSetup();
    exit(0);
} else if (argsContains("down")) {
    shutDown();
    exit(0);
} else if (argsContains("dev")) {
    runDev();
    exit(0);
} else if (argsContains("test")) {
    runTest();
    exit(0);
} else {
    exit(0);
}
