#!/usr/bin/env node

import { execSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import inquirer from "inquirer";
import chalk from "chalk";
import { fileURLToPath } from "url";

const TEMPLATE_REPO = "https://github.com/adrianchinjen/react-template.git";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isYarnInstalled = () => {
  try {
    execSync("yarn --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

(async () => {
  console.log(
    chalk.green.bold("\n🚀 Initializing Vite React TypeScript Template...\n")
  );

  const { projectName, reactVersion, packageManager } = await inquirer.prompt([
    {
      name: "projectName",
      type: "input",
      message: "What is your project name?",
      default: "my-ts-app",
    },
    {
      name: "reactVersion",
      type: "list",
      message: "Which React version do you want?",
      choices: ["18", "19"],
      default: "18",
    },
    {
      name: "packageManager",
      type: "list",
      message: "Which package manager do you want to use?",
      choices: ["npm", "yarn"],
      default: "npm",
    },
  ]);

  const appPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(appPath)) {
    console.log(
      chalk.red(`\n❌ Error: Directory '${projectName}' already exists.\n`)
    );
    process.exit(1);
  }

  try {
    console.log(
      chalk.blue(`\n📦 Creating project in ${chalk.bold(appPath)}...\n`)
    );

    // Clone the template repo
    const repoToClone = () => {
      if (reactVersion === "19") {
        execSync(
          `git clone --branch react-19 --single-branch ${TEMPLATE_REPO} "${appPath}"`,
          { stdio: "inherit" }
        );
      } else {
        execSync(`git clone ${TEMPLATE_REPO} "${appPath}"`, {
          stdio: "inherit",
        });
      }
    };

    repoToClone();

    // Navigate into the project directory
    process.chdir(appPath);

    // Remove the .git folder to start fresh
    fs.removeSync(path.join(appPath, ".git"));

    // Initialize a new Git repository
    console.log(chalk.yellow("\n🔄 Initializing a new Git repository...\n"));
    execSync("git init", { stdio: "inherit" });

    let installCommand =
      packageManager === "yarn" && isYarnInstalled() ? "yarn" : "npm install";

    console.log(
      chalk.blue(
        `\n📦 Installing dependencies using ${chalk.bold(installCommand)}...\n`
      )
    );
    execSync(installCommand, { stdio: "inherit" });

    // Create an initial commit
    console.log(chalk.yellow("\n📌 Creating initial commit...\n"));
    execSync("git add .", { stdio: "inherit" });
    execSync('git commit -m "test: initial commit from template"', {
      stdio: "inherit",
    });

    console.log(
      chalk.green("\n✅ Setup complete! WelcomeHere are the next steps:\n")
    );
    console.log(chalk.cyan(`   cd ${projectName}`));
    console.log(
      chalk.cyan(`   ${packageManager === "yarn" ? "yarn dev" : "npm run dev"}`)
    );
    console.log(chalk.green("\n🎉 Happy coding!\n"));
  } catch (error) {
    console.error(chalk.red("\n❌ Failed to create project. Error:\n"), error);
    process.exit(1);
  }
})();
