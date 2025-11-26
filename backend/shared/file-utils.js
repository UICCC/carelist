// modules/utils/fileHandler.js
const fs = require("fs");

/**
 * Reads and parses a JSON file.
 * @param {string} filename - Path to the file.
 */
async function readFile(filename) {
  try {
    const file = fs.readFileSync(filename, "utf-8");
    return JSON.parse(file);
  } catch (error) {
    throw new Error(`Couldn't read file ${filename}: ${error.message}`);
  }
}

/**
 * Writes JSON data to a file.
 * @param {string} filename - Path to the file.
 * @param {Object|Array} data - Data to write.
 */
async function writeToFile(filename, data) {
  try {
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(filename, json, "utf-8");
  } catch (error) {
    throw new Error(`Couldn't write file ${filename}: ${error.message}`);
  }
}

module.exports = { readFile, writeToFile };
