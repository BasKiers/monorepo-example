const rushLib = require('../autoinstallers/rush-lib/node_modules/@microsoft/rush-lib');
const {VersionControl} = require('../autoinstallers/rush-lib/node_modules/@microsoft/rush-lib/lib/utilities/VersionControl');
const path = require('path');
const spawn = require('child_process').spawn;

const relativePathRegex = /^[.\/\\]+$/;

function isUnderOrEqual(childPath, parentFolderPath) {
    const relativePath = path.relative(childPath, parentFolderPath);
    return relativePath === '' || relativePathRegex.test(relativePath);
}

function getChangedProjects(rushConfiguration, noFetch = false) {
    const changedFolders = VersionControl.getChangedFolders(
        VersionControl.getRemoteMasterBranch(rushConfiguration),
        noFetch
    );
    if (!changedFolders) {
        return [];
    }
    const changedPackageNames = new Set();

    const repoRootFolder = VersionControl.getRepositoryRootPath();
    rushConfiguration.projects
        .filter((project) => {
            const projectFolder = repoRootFolder
                ? path.relative(repoRootFolder, project.projectFolder)
                : project.projectRelativeFolder;
            for (const folder of changedFolders) {
                if (folder && isUnderOrEqual(folder, projectFolder)) {
                    return true;
                }
            }
            return false;
        })
        .forEach((project) => {
            changedPackageNames.add(project);
        });

    return [...changedPackageNames];
}

async function run() {
    // loadFromDefaultLocation() will search parent folders to find "rush.json" and then
    // take care of parsing it and loading related config files.
    const rushConfiguration = rushLib.RushConfiguration.loadFromDefaultLocation({
        startingFolder: process.cwd()
    });

    // const changedAndAffectedProjects = getChangedAndAffectedProjects(rushConfiguration);
    const changedPackageNames = getChangedProjects(rushConfiguration).map(project => project.packageName);

    if (!changedPackageNames.length) {
        console.log('No packages rebuild. skipping tests.');
        return;
    }

    const buildProcess = spawn('node', ['./common/scripts/install-run-rush.js', 'build', ...changedPackageNames.map(packageName => `--from=${packageName}`)]);

    buildProcess.stdout.setEncoding('utf8');
    buildProcess.stdout.on('data', function (data) {
        const str = data.toString()
        const lines = str.split(/(\r?\n)/g);
        console.log(lines.join(""));
    });

    await new Promise((resolve, reject) => {
        buildProcess.on('close', function (code) {
            console.log('process exit code ' + code);
            code ? reject(code): resolve(code);
        });
    })

    const testProcess = spawn('node', ['./common/scripts/install-run-rush.js', 'test', '--no-build', '--verbose', ...changedPackageNames.map(packageName => `--from=${packageName}`)]);

    testProcess.stdout.setEncoding('utf8');
    testProcess.stdout.on('data', function (data) {
        const str = data.toString()
        const lines = str.split(/(\r?\n)/g);
        console.log(lines.join(""));
    });

    await new Promise((resolve, reject) => {
        testProcess.on('close', function (code) {
            console.log('process exit code ' + code);
            code ? reject(code): resolve(code);
        });
    })
}

run().then((code) => {
    process.exit(code);
}).catch((code) => {
    process.exit(code)
});