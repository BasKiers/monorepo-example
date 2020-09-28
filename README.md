# Monorepo

This is an example project to show how this could work.
It uses ```RushJS``` to divide the project in packages.
Currently there is 1 shared package called ```core```
This package is used in the other packages: ```api``` & ```processor```.
For each package there is a ```.github/workflow``` that is only run when necessary (when the package changes OR core changes).
Then tests are run only on the affected packages.

