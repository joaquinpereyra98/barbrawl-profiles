import CONSTANTS from "./constants.mjs";
/**
 * Generates a unique bar ID for a new resource bar.
 * - If no bars exist, it starts with `"bar1"`.
 * - If `"bar1"` to `"bar9"` are occupied, it generates `"bar[randomID()]"`.
 *
 * @param {string[]} barsIds - An array of existing bar IDs.
 * @returns {Object} - The default bar configuration.
 */
const getDefaultBarData = (barsIds) => {
  let id = null;

  // Try to find an available bar ID from "bar1" to "bar9"
  for (let i = 1; i <= 9; i++) {
    const barId = `bar${i}`;
    if (!barsIds.includes(barId)) {
      id = barId;
      break;
    }
  }

  // If all "bar1" to "bar9" are taken, generate a random ID
  if (!id) {
    id = `bar${foundry.utils.randomID()}`;
  }

  const defaultConfig = {
    id,
    order: id === "bar2" ? 1 : 0,
    attribute: "custom",
    mincolor: { bar1: "#FF0000", bar2: "#000080" }[id] || "#000000",
    maxcolor: { bar1: "#80FF00", bar2: "#80B3FF" }[id] || "#FFFFFF",
    position: id === "bar2" ? "top-inner" : "bottom-inner",
    value: 10,
    max: 10,
    gmVisibility: CONSTANTS.BAR_VISIBILITY.INHERIT,
    ownerVisibility: CONSTANTS.BAR_VISIBILITY.ALWAYS,
    otherVisibility: CONSTANTS.BAR_VISIBILITY.NONE,
  };

  return defaultConfig;
};

/**
 * Creates the first two bars with specific configurations.
 * @returns {Object} - An object containing the configurations for "bar1" and "bar2".
 */
function createFirstTwoBars() {
  const bar1 = {
    id: "bar1",
    order: 0,
    attribute: "custom",
    mincolor: "#FF0000",
    maxcolor: "#80FF00",
    position: "bottom-inner",
    value: 10,
    max: 10,
    gmVisibility: CONSTANTS.BAR_VISIBILITY.INHERIT,
    ownerVisibility: CONSTANTS.BAR_VISIBILITY.ALWAYS,
    otherVisibility: CONSTANTS.BAR_VISIBILITY.NONE,
  };

  const bar2 = {
    id: "bar2",
    order: 1,
    attribute: "custom",
    mincolor: "#000080",
    maxcolor: "#80B3FF",
    position: "top-inner",
    value: 10,
    max: 10,
    gmVisibility: CONSTANTS.BAR_VISIBILITY.INHERIT,
    ownerVisibility: CONSTANTS.BAR_VISIBILITY.ALWAYS,
    otherVisibility: CONSTANTS.BAR_VISIBILITY.NONE,
  };

  return { bar1, bar2 };
}

/**
 * Generates a new unique profile name based on existing profiles.
 *
 * @param {Array<{ name: string }>} profiles - List of profiles.
 * @returns {String} - A unique profile name.
 */
function generateNewProfileName(profiles) {
  const baseName = "New Profile";
  if (!profiles.length) return baseName;

  const existingNames = new Set(profiles.map((p) => p.name));
  let number = 1;

  while (existingNames.has(`${baseName} (${number})`)) number++;

  return number === 1 ? baseName : `${baseName} (${number})`;
}

const UTILS = {
  getDefaultBarData,
  createFirstTwoBars,
  generateNewProfileName,
};

export default UTILS;
