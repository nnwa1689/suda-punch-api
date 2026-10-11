// Jest 26 不支援 node: 前綴的核心模組，轉接至 'worker_threads'
module.exports = require('worker_threads');
