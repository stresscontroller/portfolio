# CruiseCode

## Setup

Clone the repository

```bash
git clone https://AlaskaX@dev.azure.com/AlaskaX/CruiseCodeAngular/_git/CruiseCodeAngular

cd CruiseCodeAngular/cruise-code
```

Install dependencies

```bash
npm i
```

Run the app locally

```bash
npm run start
```

Setup Husky if it doesn't automatically setup your git hooks (this should trigger linting when you do a git commit and a build when you're pushing to git)

```bash
npm run prepare
```

## Project Structure Overview

### Other parts of the application

-   `shared`: contains shared components and pipes (services that are meant to be singleton are located inside `core`).
-   `core`: contains helper functions and singleton services such as `constants`, `guards`, `models`, `services`, `state`, and `utils`.

### Additional notes

Most services (especially the api related ones) are stateless. Application state are all managed either contextually in the component (if its local to the component) or in the `*.state.ts` files in the `src/core/states` directory.
