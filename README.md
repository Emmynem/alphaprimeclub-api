# alphaprimeclub-api

This is a Rest API used for accepting member applications at Alpha Prime Club.

## Available Scripts

The following scripts are available in the `package.json`:

- **`start`**: Runs the application in production mode.
- **`build`**: Cleans the `dist-app` directory and transpiles the source code.
- **`server`**: Starts the server from the transpiled code.
- **`dev`**: Runs the application in development mode, including building and starting the server.
- **`prod`**: Builds the application and starts the server in production mode.
- **`transpile`**: Transpiles the source code using Babel.
- **`clean`**: Removes the `dist-app` directory.
- **`watch:dev`**: Starts the application in development mode with file watching using `nodemon`.
- **`test`**: Placeholder for running tests (currently not implemented).

## Getting Started

To get started, clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd drippo-lifestyle-api
npm install
```

### Development

To run the application in development mode:

```bash
npm run dev
```

### Production

To build and run the application in production mode:

```bash
npm run prod
```

### Cleaning and Building

To clean the build directory and transpile the source code:

```bash
npm run build
```

### Watching for Changes

To start the application in development mode with file watching:

```bash
npm run watch:dev
```

