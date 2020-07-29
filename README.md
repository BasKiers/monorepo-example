# Monorepo

This is an example project to show how this could work.
It uses ```yarn workspace``` to divide the project in packages.
Currently there is 1 shared package called ```core```
This package is used in the other packages: ```api``` & ```processor```.
For each package there is a ```.github/workflow``` that is only run when necessary (when the package changes OR core changes).
Then tests are run and a docker image is build. It uses docker-compose to build, but could be easily changed to use docker.
Because everything is nodejs, there is only 1 ```Dockerfile``` that takes the name of the package as an ```ARG```.

## NEXT STEPS:
- [ ] Use docker-compose to run the dev-environment
- [ ] Add linting
- [ ] Tag the images & push to registry

# monorepo-example
