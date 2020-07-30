const rushLib = require('../autoinstallers/rush-lib/node_modules/@microsoft/rush-lib');
const spawn = require('child_process').spawn;

async function run() {
    // loadFromDefaultLocation() will search parent folders to find "rush.json" and then
    // take care of parsing it and loading related config files.
    const rushConfiguration = rushLib.RushConfiguration.loadFromDefaultLocation({
        startingFolder: process.cwd()
    });

    const buildProcess = spawn('node', ['./common/scripts/install-run-rush.js', 'build', '--changed-projects-only']);

    const isPackageChangeRegex = /\[([@/-0-9a-z]+)\]\s+completed/i;
    const changedPackages = [];
    buildProcess.stdout.setEncoding('utf8');
    buildProcess.stdout.on('data', function (data) {
        const str = data.toString()
        const lines = str.split(/(\r?\n)/g);

        changedPackages.push(
            ...lines.map(line => line.match(isPackageChangeRegex)).filter(Boolean).map((result) => (console.log(result), result[1]))
        );

        console.log(lines.join(""));
    });

    await new Promise((resolve) => {
        buildProcess.on('close', function (code) {
            console.log('process exit code ' + code);
            resolve();
        });
    })

    if (!changedPackages.length) {
        console.log('No packages rebuild. skipping tests.');
        return;
    }

    const testProcess = spawn('node', ['./common/scripts/install-run-rush.js', 'test', '--no-build', ...changedPackages.map(packageName => `--from=${packageName}`)]);

    testProcess.stdout.setEncoding('utf8');
    testProcess.stdout.on('data', function (data) {
        const str = data.toString()
        const lines = str.split(/(\r?\n)/g);
        console.log(lines.join(""));
    });

    await new Promise((resolve) => {
        testProcess.on('close', function (code) {
            console.log('process exit code ' + code);
            resolve();
        });
    })
}

run();