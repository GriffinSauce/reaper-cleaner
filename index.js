const glob = require("glob");
const fs = require("fs-extra");
const _ = require("lodash");

const testDir = "test_files";
const reaperProjectFiles = glob.sync(`${testDir}/**/*{.rpp,.rpp-bak}`, {
  nocase: true,
});

console.log(`Found ${reaperProjectFiles.length} project files`);

let usedFiles = new Set();
let usedFileTypes = new Set();
const recordPaths = new Set();
const projectFolders = new Set();
const recordPathRegex = /RECORD_PATH\s*"([^"]+?)"/g;
const fileRegex = /FILE\s*"([^"]+?)"/g;

reaperProjectFiles.map(projectPath => {
  console.log(` Processing ${projectPath}`);
  const projectText = fs.readFileSync(projectPath, "utf8");

  // record path
  const recordPathMatch = recordPathRegex.exec(projectText);
  const recordPath = recordPathMatch ? recordPathMatch[1] : "";

  // project folder
  const projectFolder =
    projectPath.split("/").length > 1 ? projectPath.split("/")[0] : "";

  // files
  const fileMatches = [];
  const fileTypes = new Set();
  let match;
  while ((match = fileRegex.exec(projectText)) !== null) {
    const filePath = match[1];
    fileMatches.push(filePath);
    fileTypes.add(filePath.split(".").pop());
  }

  console.log(` - Project folder: "${projectFolder}"`);
  console.log(` - Record path: "${recordPath}"`);
  console.log(
    ` - Found ${fileMatches.length} files (${[...fileTypes].join(", ")})`,
  );
  projectFolders.add(projectFolder);
  recordPaths.add(recordPath);
  usedFiles = new Set([...usedFiles, ...fileMatches]);
  usedFileTypes = new Set([...usedFileTypes, ...fileTypes]);
});

const usedFilesArray = [...usedFiles];
const fileExtensionsMatch = [...usedFileTypes].map(ext => `.${ext}`).join(",");
console.log(
  `Found ${
    usedFilesArray.length
  } file references in projects with filetypes: ${fileExtensionsMatch} and record paths ${[
    ...recordPaths,
  ].join(" ")}`,
);

const reaperFileTypes = ".wav,.wv,.ogg,.opus,.mp3,.flac,.lcf";
let mediaFiles = glob.sync(`${testDir}/**/*{${reaperFileTypes}}`, {
  nocase: true,
});

const filterPaths = [...projectFolders, ...recordPaths].reduce(
  (acc, path) => (path ? [...acc, `${path}\/`, `${path}\\\\`] : acc),
  [],
);
const filter = new RegExp(`${filterPaths.join("|")}`, "gi");
const unused = _.differenceWith(
  mediaFiles,
  usedFilesArray,
  (mediaFile, usedFile) =>
    mediaFile.replace(filter, "") === usedFile.replace(filter, ""),
);
console.log(
  `Found ${mediaFiles.length} media files, ${unused.length} are unused`,
);

const putUnusedPath = `${testDir}/unused_media_files`;
fs.ensureDirSync(putUnusedPath);
unused.forEach(path => {
  const fileName = path.split("/").pop();
  console.log(fileName);
  fs.moveSync(path, `${putUnusedPath}\\${fileName}`, { overwrite: true });
});
