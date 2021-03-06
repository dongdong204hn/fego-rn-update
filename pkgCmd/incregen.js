/**
 * 增量包生成脚本入口文件
 */
var configs = require('./config');
var jsbundle = require('./incre/jsbundle');
var assets = require('./incre/assets');
var fs = require('fs');
var zipper = require("zip-local");

/******************** 变量说明 *******************/
// sdk版本
var sdkVer = configs.sdkVer;
// 最新版本号
var newVer = 0;
// ios/android, 执行本脚本时可以作为参数传入
var platform = 'android';
if (3 == process.argv.length) {
	platform = process.argv[2];
}
console.log(platform);
// 包路径前缀
var pathPrefix = '';
// 增量包路径前缀；
var incrementPathPrefix = '';
// 全量包路径前缀：
var allPathPrefix = '';
//全量包bundle的名字
const bundleName = 'index.jsbundle';
//增量包里bundle的名字
const incrementBundleName = 'increment.jsbundle';

/******************** 生成步骤 *******************/
/**
 * 1、首先解压未解压的所有需要比较的包
 * @param {*} platform 平台，android/ios
 */
function unzipAll() {
	pathPrefix = configs.path + platform;
	incrementPathPrefix = pathPrefix + '/increment/';
	allPathPrefix = pathPrefix + '/all/';

	// 看增量config是否存在，如果存在，则删除
	if (fs.existsSync(incrementPathPrefix + '/config')) {
		fs.unlinkSync(incrementPathPrefix + '/config')
	}
	console.log(allPathPrefix + sdkVer + '/config')

	// 看全量包中是否有包存在（打包脚本在第一次使用时会自动生成config文件，如果没有该文件，说明没有包存在）
	if (!fs.existsSync(allPathPrefix + sdkVer + '/config')) {
		console.log("还没有可用的包，请先生成包");
		newVer = 0;
		return;
	}

	// 读取全量包中config文件，获取最新版本号
	let config = fs.readFileSync(allPathPrefix + sdkVer + '/config');
	console.log(config + '**************');
	newVer = Number.parseInt(config);
	if (newVer === 0) {// 如果取到的值为0，则说明这是首次生成增量包，需要将最新版本更改为1
		newVer = 1;
	}

	// 从最新包开始依次解压包
	for (let i = newVer; i >= Number.parseInt(config); i--) {
		var zipName = 'rn_' + sdkVer + '_' + i;

		// 兼容只存在老包就执行增量更新的情况，判断是否存在新包，不存在就终止整个脚本运行
		if (!fs.existsSync(allPathPrefix + sdkVer + '/' + zipName + '.zip')) {
			console.log("新包" + zipName + ".zip不存在，请先生成新包");
			newVer = 0;
			return;
		}

		// 将解压包存放至temp文件中，方便git忽略
		if (!fs.existsSync(allPathPrefix + 'temp/')) {
			fs.mkdirSync(allPathPrefix + 'temp/');
		}
		if (!fs.existsSync(allPathPrefix + 'temp/' + sdkVer)) {
			fs.mkdirSync(allPathPrefix + 'temp/' + sdkVer);
		}
		if (!fs.existsSync(allPathPrefix + 'temp/' + sdkVer + '/' + zipName)) {
			fs.mkdirSync(allPathPrefix + 'temp/' + sdkVer + '/' + zipName);
		}

		// 解压包
		zipper.sync.unzip(allPathPrefix + sdkVer + '/' + zipName + ".zip").save(allPathPrefix + 'temp/' + sdkVer + '/' + zipName);
	}

	// 更新config文件，将其改为newVer+1
	fs.writeFileSync(allPathPrefix + sdkVer + '/config', (newVer + 1) + '');
}

/**
 * 2、开始生成包，其中包括增量包生成、压缩
 * @param {*} platform 平台，android/ios
 */
function generateIncrement() {
	for (let i = newVer - 1; i >= 0; i--) {
		let bundleIncrement = new Promise(function (resolve, reject) {
			new jsbundle(i, newVer, sdkVer, platform);
		})
	}
}

// 1、首先解压未解压的所有需要比较的包
unzipAll();
// 2、开始生成包，其中包括增量包生成、压缩
generateIncrement();
