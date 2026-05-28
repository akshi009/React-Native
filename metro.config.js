/**
 * Metro configuration
 * @ts-check
 *
 * To read more about MakeConfig:
 * https://docs.expo.dev/versions/latest/config/metro/
 */

const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;