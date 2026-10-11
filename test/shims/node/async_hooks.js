// Jest 26 不支援 node: 前綴的核心模組，轉接至 'async_hooks'
module.exports = require('async_hooks');
