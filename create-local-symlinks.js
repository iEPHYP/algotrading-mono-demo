const fs = require("fs");
const path = require("path");

const rootDir = __dirname;

const packageJson = require(path.join(rootDir, "package.json"));

const appsList = packageJson.workspaces;

const createSymlink = (dependencyName, app) => {
  const packageDir = path.join(rootDir, "node_modules", dependencyName);
  const appDir = path.join(rootDir, app);
  const appNodeModulesPath = path.join(appDir, "node_modules");
  const symlinkDir = path.join(appNodeModulesPath, dependencyName);

  // Check if the namespace folder exists
  const namespaceFolder = dependencyName.split("/")[0];
  const namespaceFolderPath = path.join(appNodeModulesPath, namespaceFolder);

  // Create the namespace folder and nested directories if they don't exist
  fs.mkdirSync(namespaceFolderPath, { recursive: true });

  // Create the symlink
  fs.symlinkSync(packageDir, symlinkDir, "junction");
};

// Парсим package.json файл каждого подпроекта и создаем symlink-и
appsList.forEach((app) => {
  const appPackageJson = require(path.join(rootDir, app, "package.json"));
  const dependencies = appPackageJson.dependencies || {};

  // Создаем symlink-и для зависимостей с префиксом @algotrading
  const algotradingDependencies = Object.keys(dependencies).filter(
    (dependencyName) => dependencyName.startsWith("@algotrading")
  );

  algotradingDependencies.forEach((dependencyName) => {
    createSymlink(dependencyName, app);
  });
});
