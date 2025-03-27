


// REVIEW - Next.js 框架的 CLI（命令行工具）的完整实现
// 使用 commander.js 库构建。它定义了多个命令（如 build、dev、start 等）

// node inspect ./node_modules/next/dist/bin/next 
// 上面是debugger命令



Object.defineProperty(exports, "__esModule", {
  value: true
});


require("../server/require-hook");
const _commander = require("next/dist/compiled/commander");
const _log = require("../build/output/log");
const _semver = _interop_require_default(require("next/dist/compiled/semver"));
const _picocolors = require("../lib/picocolors");
const _formatclihelpoutput = require("../lib/format-cli-help-output");
const _constants = require("../lib/constants");
const _utils = require("../server/lib/utils");
const _nexttest = require("../cli/next-test.js");
function _interop_require_default(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}


// 环境检测
if (process.env.NEXT_RSPACK) {
  process.env.RSPACK_CONFIG_VALIDATE = 'loose-silent';
}
if (!_semver.default.satisfies(process.versions.node, "^18.18.0 || ^19.8.0 || >= 20.0.0", { includePrerelease: true })) {
  console.error(`You are using Node.js ${process.versions.node}. For Next.js, Node.js version "${"^18.18.0 || ^19.8.0 || >= 20.0.0"}" is required.`);
  process.exit(1);
}

// 性能标注开始
performance.mark('next-start');

// 检查 react 和 react-dom 是否存在于项目的依赖中。如果没有，则发出警告并提供安装命令。
for (const dependency of ['react', 'react-dom']) {
  try {
    // 解析模块的路径。如果模块存在，require.resolve 会返回该模块的路径。如果模块不存在，它会抛出一个错误
    require.resolve(dependency);
  } catch (err) {
    console.warn(`The module '${dependency}' was not found. Next.js requires that you include it in 'dependencies' of your 'package.json'. To add it, run 'npm install ${dependency}'`);
  }
}
require.resolve = function (request, options) {
  validateString(request, 'request');
  return Module._resolveFilename(request, mod, false, options);
}


// 扩展基础命令类，统一管理所有子命令的公共逻辑。
class NextRootCommand extends _commander.Command {
  createCommand(name) {
    const command = new _commander.Command(name);
    command.addOption(new _commander.Option('--inspect').hideHelp());
    command.hook('preAction', (event) => {
      const commandName = event.name();
      const defaultEnv = commandName === 'dev' ? 'development' : 'production';
      const standardEnv = ['production', 'development', 'test'];
      if (process.env.NODE_ENV) {
        const isNotStandard = !standardEnv.includes(process.env.NODE_ENV);
        const shouldWarnCommands = process.env.NODE_ENV === 'development' ? ['start', 'build'] : process.env.NODE_ENV === 'production' ? ['dev'] : [];
        if (isNotStandard || shouldWarnCommands.includes(commandName)) {
          (0, _log.warn)(_constants.NON_STANDARD_NODE_ENV);
        }
      };
      process.env.NODE_ENV = process.env.NODE_ENV || defaultEnv;
      process.env.NEXT_RUNTIME = 'nodejs';
      if (event.getOptionValue('inspect') === true) {
        console.error(`\`--inspect\` flag is deprecated. Use env variable NODE_OPTIONS instead: NODE_OPTIONS='--inspect' next ${commandName}`);
        process.exit(1);
      }
    });
    return command;
  }
}

const program = new NextRootCommand();


// 根命令定义
program.name('next')
  .description('The Next.js CLI allows you to develop, build, start your application, and more.')
  .configureHelp({
    formatHelp: (cmd, helper) => (0, _formatclihelpoutput.formatCliHelpOutput)(cmd, helper),
    subcommandTerm: (cmd) => `${cmd.name()} ${cmd.usage()}`
  })
  .helpCommand(false)
  .helpOption('-h, --help', 'Displays this message.')
  .version(`Next.js v${"15.2.4"}`, '-v, --version', 'Outputs the Next.js version.');


// 子命令定义
program.command('build')
  .description('Creates an optimized production build of your application. The output displays information about each route.')
  .argument('[directory]', `A directory on which to build the application. ${(0, _picocolors.italic)('If no directory is provided, the current directory will be used.')}`)
  .option('-d, --!debug', 'Enables a more verbose build output.')
  .option('--no-lint', 'Disables linting.')
  .option('--no-mangling', 'Disables mangling.')
  .option('--profile', 'Enables production profiling for React.')
  .option('--experimental-app-only', 'Builds only App Router routes.')
  .addOption(new _commander.Option('--experimental-turbo').hideHelp())
  .addOption(
    new _commander.Option('--experimental-build-mode [mode]', 'Uses an experimental build mode.')
      .choices(['compile', 'generate'])
      .default('default')
  )
  .option('--experimental-debug-memory-usage', 'Enables memory profiling features to debug memory consumption.')
  .option('--experimental-upload-trace, <traceUrl>', 'Reports a subset of the debugging trace to a remote HTTP URL. Includes sensitive data.')
  .action((directory, options) => import('../cli/next-build.js').then((mod) => mod.nextBuild(options, directory).then(() => process.exit(0))))
  .usage('[directory] [options]');


// 子命令定义
program.command('dev', { isDefault: true })
  .description('Starts Next.js in development mode with hot-code reloading, error reporting, and more.')
  .argument('[directory]', `A directory on which to build the application. ${(0, _picocolors.italic)('If no directory is provided, the current directory will be used.')}`)
  .option('--turbo', 'Starts development mode using Turbopack.')
  .option('--turbopack', 'Starts development mode using Turbopack.')
  .addOption(new _commander.Option('-p, --port <port>', 'Specify a port number on which to start the application.')
    .argParser(_utils.parseValidPositiveInteger).default(3000).env('PORT'))
  .option('-H, --hostname <hostname>', 'Specify a hostname on which to start the application (default: 0.0.0.0).')
  .option('--disable-source-maps', "Don't start the Dev server with `--enable-source-maps`.", false)
  .option('--experimental-https', 'Starts the server with HTTPS and generates a self-signed certificate.')
  .option('--experimental-https-key, <path>', 'Path to a HTTPS key file.')
  .option('--experimental-https-cert, <path>', 'Path to a HTTPS certificate file.')
  .option('--experimental-https-ca, <path>', 'Path to a HTTPS certificate authority file.')
  .option('--experimental-upload-trace, <traceUrl>', 'Reports a subset of the debugging trace to a remote HTTP URL. Includes sensitive data.')
  .action((directory, options, { _optionValueSources }) => {
    const portSource = _optionValueSources.port;

    // !这里可以看到dev下去了这个文件，在终端运行以下命令，然后去那边debugger
    // !命令是：node inspect ./node_modules/next/dist/cli/next-dev.js
    // 然后拿到经过包装的exports对象结果，来到这里执行 nextDev 函数
    import('../cli/next-dev.js').then((mod) => mod.nextDev(options, portSource, directory));
  })
  .usage('[directory] [options]');


// 子命令定义
program.command('export', { hidden: true })
  .action(() => import('../cli/next-export.js').then((mod) => mod.nextExport()))
  .helpOption(false);


// 子命令定义
program.command('info')
  .description('Prints relevant details about the current system which can be used to report Next.js bugs.')
  .addHelpText('after', `\nLearn more: ${(0, _picocolors.cyan)('https://nextjs.org/docs/api-reference/cli#info')}`)
  .option('--verbose', 'Collects additional information for debugging.')
  .action((options) => import('../cli/next-info.js').then((mod) => mod.nextInfo(options)));


program.command('lint')
  .description('Runs ESLint for all files in the `/src`, `/app`, `/pages`, `/components`, and `/lib` directories. It also provides a guided setup to install any required dependencies if ESLint is not already configured in your application.')
  .argument('[directory]', `A base directory on which to lint the application. ${(0, _picocolors.italic)('If no directory is provided, the current directory will be used.')}`)
  .option('-d, --dir, <dirs...>', 'Include directory, or directories, to run ESLint.')
  .option('--file, <files...>', 'Include file, or files, to run ESLint.')
  .addOption(new _commander.Option('--ext, [exts...]', 'Specify JavaScript file extensions.')
    .default(['.js', '.mjs', '.cjs', '.jsx', '.ts', '.mts', '.cts', '.tsx']))
  .option('-c, --config, <config>', 'Uses this configuration file, overriding all other configuration options.')
  .option('--resolve-plugins-relative-to, <rprt>', 'Specify a directory where plugins should be resolved from.')
  .option('--strict', 'Creates a `.eslintrc.json` file using the Next.js strict configuration.')
  .option('--rulesdir, <rulesdir...>', 'Uses additional rules from this directory(s).')
  .option('--!fix', 'Automatically fix linting issues.')
  .option('--!fix-type <fixType>', 'Specify the types of fixes to apply (e.g., problem, suggestion, layout).')
  .option('--ignore-path <path>', 'Specify a file to ignore.')
  .option('--no-ignore', 'Disables the `--ignore-path` option.')
  .option('--quiet', 'Reports errors only.')
  .addOption(new _commander.Option('--max-warnings [maxWarnings]', 'Specify the number of warnings before triggering a non-zero exit code.')
    .argParser(_utils.parseValidPositiveInteger).default(-1))
  .option('-o, --output-file, <outputFile>', 'Specify a file to write report to.')
  .option('-f, --format, <format>', 'Uses a specific output format.')
  .option('--no-inline-config', 'Prevents comments from changing config or rules.')
  .addOption(new _commander.Option('--report-unused-disable-directives-severity <level>', 'Specify severity level for unused eslint-disable directives.')
    .choices(['error', 'off', 'warn']))
  .option('--no-cache', 'Disables caching.')
  .option('--cache-location, <cacheLocation>', 'Specify a location for cache.')
  .addOption(new _commander.Option('--cache-strategy, [cacheStrategy]', 'Specify a strategy to use for detecting changed files in the cache.')
    .default('metadata'))
  .option('--error-on-unmatched-pattern', 'Reports errors when any file patterns are unmatched.')
  .action((directory, options) => import('../cli/next-lint.js').then((mod) => mod.nextLint(options, directory)))
  .usage('[directory] [options]');


program.command('start')
  .description('Starts Next.js in production mode. The application should be compiled with `next build` first.')
  .argument('[directory]', `A directory on which to start the application. ${(0, _picocolors.italic)('If no directory is provided, the current directory will be used.')}`)
  .addOption(new _commander.Option('-p, --port <port>', 'Specify a port number on which to start the application.')
    .argParser(_utils.parseValidPositiveInteger).default(3000).env('PORT'))
  .option('-H, --hostname <hostname>', 'Specify a hostname on which to start the application (default: 0.0.0.0).')
  .addOption(new _commander.Option('--keepAliveTimeout <keepAliveTimeout>', 'Specify the maximum amount of milliseconds to wait before closing inactive connections.')
    .argParser(_utils.parseValidPositiveInteger))
  .action((directory, options) => import('../cli/next-start.js').then((mod) => mod.nextStart(options, directory)))
  .usage('[directory] [options]');


program.command('telemetry')
  .description(`Allows you to enable or disable Next.js' ${(0, _picocolors.bold)('completely anonymous')} telemetry collection.`)
  .addArgument(new _commander.Argument('[arg]').choices(['disable', 'enable', 'status']))
  .addHelpText('after', `\nLearn more: ${(0, _picocolors.cyan)('https://nextjs.org/telemetry')}`)
  .addOption(new _commander.Option('--enable', `Enables Next.js' telemetry collection.`).conflicts('disable'))
  .option('--disable', `Disables Next.js' telemetry collection.`)
  .action((arg, options) => import('../cli/next-telemetry.js').then((mod) => mod.nextTelemetry(options, arg)));


program.command('experimental-test')
  .description(`Execute \`next/experimental/testmode\` tests using a specified test runner. The test runner defaults to 'playwright' if the \`experimental.defaultTestRunner\` configuration option or the \`--test-runner\` option are not set.`)
  .argument('[directory]', `A Next.js project directory to execute the test runner on. ${(0, _picocolors.italic)('If no directory is provided, the current directory will be used.')}`)
  .argument('[test-runner-args...]', 'Any additional arguments or options to pass down to the test runner `test` command.')
  .option('--test-runner [test-runner]', `Any supported test runner. Options: ${(0, _picocolors.bold)(_nexttest.SUPPORTED_TEST_RUNNERS_LIST.join(', '))}. ${(0, _picocolors.italic)("If no test runner is provided, the Next.js config option `experimental.defaultTestRunner`, or 'playwright' will be used.")}`)
  .allowUnknownOption().action((directory, testRunnerArgs, options) => {
    return import('../cli/next-test.js').then((mod) => {
      mod.nextTest(directory, testRunnerArgs, options);
    });
  }).usage('[directory] [options]');


const internal = program.command('internal').description('Internal debugging commands. Use with caution. Not covered by semver.');
internal.command('turbo-trace-server').argument('[file]', 'Trace file to serve.').action((file) => {
  return import('../cli/internal/turbo-trace-server.js').then((mod) => mod.startTurboTraceServerCli(file));
});


program.parse(process.argv);


//# sourceMappingURL=next.map








// REVIEW - next dev的文件入口
// node inspect ./node_modules/next/dist/cli/next-dev.js命令执行之后进来这里！


Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "nextDev", {
  enumerable: true,
  get: function () {
    return nextDev;
  }
});


require("../server/lib/cpu-profile");
const _utils = require("../server/lib/utils");
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../build/output/log"));
const _getprojectdir = require("../lib/get-project-dir");
const _constants = require("../shared/lib/constants");
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _shared = require("../trace/shared");
const _storage = require("../telemetry/storage");
const _config = /*#__PURE__*/ _interop_require_default(require("../server/config"));
const _findpagesdir = require("../lib/find-pages-dir");
const _fileexists = require("../lib/file-exists");
const _getnpxcommand = require("../lib/helpers/get-npx-command");
const _mkcert = require("../lib/mkcert");
const _uploadtrace = /*#__PURE__*/ _interop_require_default(require("../trace/upload-trace"));
const _env = require("@next/env");
const _child_process = require("child_process");
const _getreservedport = require("../lib/helpers/get-reserved-port");
const _os = /*#__PURE__*/ _interop_require_default(require("os"));
const _nodeevents = require("node:events");
const _timers = require("timers");
const _trace = require("../trace");

function _interop_require_default(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}
function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function (nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return {
      default: obj
    };
  }
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {
    __proto__: null
  };
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}


let dir;
let child;
let config;
let isTurboSession = false;
let traceUploadUrl;
let sessionStopHandled = false;
let sessionStarted = Date.now();
let sessionSpan = (0, _trace.trace)('next-dev');


const CHILD_EXIT_TIMEOUT_MS = parseInt(process.env.NEXT_EXIT_TIMEOUT_MS ?? '100', 10);

const handleSessionStop = async (signal) => {
  if (signal != null && (child == null ? void 0 : child.pid)) child.kill(signal);
  if (sessionStopHandled) return;
  sessionStopHandled = true;

  if (signal != null && (child == null ? void 0 : child.pid) && child.exitCode === null && child.signalCode === null) {
    let exitTimeout = setTimeout(() => {
      child == null ? void 0 : child.kill('SIGKILL');
    }, CHILD_EXIT_TIMEOUT_MS);
    await (0, _nodeevents.once)(child, 'exit').catch(() => { });
    (0, _timers.clearTimeout)(exitTimeout);
  }

  sessionSpan.stop();
  await (0, _trace.flushAllTraces)({
    end: true
  });

  try {
    const { eventCliSessionStopped } = require('../telemetry/events/session-stopped');
    config = config || await (0, _config.default)(_constants.PHASE_DEVELOPMENT_SERVER, dir);
    let telemetry = _shared.traceGlobals.get('telemetry') || new _storage.Telemetry({
      distDir: _path.default.join(dir, config.distDir)
    });
    let pagesDir = !!_shared.traceGlobals.get('pagesDir');
    let appDir = !!_shared.traceGlobals.get('appDir');
    if (typeof _shared.traceGlobals.get('pagesDir') === 'undefined' || typeof _shared.traceGlobals.get('appDir') === 'undefined') {
      const pagesResult = (0, _findpagesdir.findPagesDir)(dir);
      appDir = !!pagesResult.appDir;
      pagesDir = !!pagesResult.pagesDir;
    }
    telemetry.record(eventCliSessionStopped({
      cliCommand: 'dev',
      turboFlag: isTurboSession,
      durationMilliseconds: Date.now() - sessionStarted,
      pagesDir,
      appDir
    }), true);
    telemetry.flushDetached('dev', dir);
  } catch (_) {
    // errors here aren't actionable so don't add
    // noise to the output
  }
  if (traceUploadUrl) {
    (0, _uploadtrace.default)({
      traceUploadUrl,
      mode: 'dev',
      projectDir: dir,
      distDir: config.distDir,
      isTurboSession
    });
  }
  // ensure we re-enable the terminal cursor before exiting
  // the program, or the cursor could remain hidden
  process.stdout.write('\x1B[?25h');
  process.stdout.write('\n');
  process.exit(0);
};

// 在 Node.js 应用中捕获 SIGINT 信号（通常由用户按下 Ctrl+C 触发），并调用 handleSessionStop 函数进行优雅的进程关闭
process.on('SIGINT', () => handleSessionStop('SIGINT'));
process.on('SIGTERM', () => handleSessionStop('SIGTERM'));
process.on('exit', () => child == null ? void 0 : child.kill('SIGKILL'));


// 这个函数在加载了脚手架之后，then那边执行！
const nextDev = async (options, portSource, directory) => {
  // 入参：
  // options，一个对象，下面是他的属性
  // disableSourceMaps: false
  // port: 3000
  // portSource是一个字符串，"default"
  // directory是undefined


  // （一）拿到相关信息
  // 1. 拿到项目根目录并检验
  dir = (0, _getprojectdir.getProjectDir)(process.env.NEXT_PRIVATE_DEV_DIR || directory);
  if (!await (0, _fileexists.fileExists)(dir, _fileexists.FileType.Directory)) {
    (0, _utils.printAndExit)(`> No such directory exists as the project root: ${dir}`);
  }


  async function preflight(skipOnReboot) {
    const { getPackageVersion, getDependencies } = await Promise.resolve(require('../lib/get-package-version'));
    const [sassVersion, nodeSassVersion] = await Promise.all([
      getPackageVersion({
        cwd: dir,
        name: 'sass'
      }),
      getPackageVersion({
        cwd: dir,
        name: 'node-sass'
      })
    ]);
    if (sassVersion && nodeSassVersion) {
      _log.warn('Your project has both `sass` and `node-sass` installed as dependencies, but should only use one or the other. ' + 'Please remove the `node-sass` dependency from your project. ' + ' Read more: https://nextjs.org/docs/messages/duplicate-sass');
    }
    if (!skipOnReboot) {
      const { dependencies, devDependencies } = await getDependencies({
        cwd: dir
      });
      // Warn if @next/font is installed as a dependency. Ignore `workspace:*` to not warn in the Next.js monorepo.
      if (dependencies['@next/font'] || devDependencies['@next/font'] && devDependencies['@next/font'] !== 'workspace:*') {
        const command = (0, _getnpxcommand.getNpxCommand)(dir);
        _log.warn('Your project has `@next/font` installed as a dependency, please use the built-in `next/font` instead. ' + 'The `@next/font` package will be removed in Next.js 14. ' + `You can migrate by running \`${command} @next/codemod@latest built-in-next-font .\`. Read more: https://nextjs.org/docs/messages/built-in-next-font`);
      }
    }
  }

  // 2. 拿到端口号并检验
  let port = options.port;
  if ((0, _getreservedport.isPortIsReserved)(port)) {
    (0, _utils.printAndExit)((0, _getreservedport.getReservedPortExplanation)(port), 1);
  }

  const allowRetry = portSource === 'default';
  const host = options.hostname;

  // 3. 拿到next.config配置项并验证
  config = await (0, _config.default)(_constants.PHASE_DEVELOPMENT_SERVER, dir);
  if (options.experimentalUploadTrace && !process.env.NEXT_TRACE_UPLOAD_DISABLED) {
    traceUploadUrl = options.experimentalUploadTrace;
  }

  // 4. 整合信息
  const devServerOptions = {
    dir,
    port,
    allowRetry,
    isDev: true,
    hostname: host
  };

  if (options.turbo || options.turbopack) {
    process.env.TURBOPACK = '1';
  }
  isTurboSession = !!process.env.TURBOPACK;

  // 拿到build之后存放的文件夹目录
  // "D:\aa_frontEnd\next_practice\.next"
  const distDir = _path.default.join(dir, config.distDir ?? '.next');

  (0, _shared.setGlobal)('phase', _constants.PHASE_DEVELOPMENT_SERVER);
  (0, _shared.setGlobal)('distDir', distDir);

  // 准备开始开启服务器了！
  const startServerPath = require.resolve('../server/lib/start-server');
  async function startServer(startServerOptions) {
    // 直接返回一个promise对象
    return new Promise((resolve) => {
      let resolved = false;

      // 1. 拿到相关的变量
      // defaultEnv是环境变量、nodeOptions是{}，nodeDebugType是inspect-brk，maxOldSpaceSize是undefined
      const defaultEnv = _env.initialEnv || process.env;
      const nodeOptions = (0, _utils.getParsedNodeOptionsWithoutInspect)();
      const nodeDebugType = (0, _utils.getNodeDebugType)();
      let maxOldSpaceSize = (0, _utils.getMaxOldSpaceSize)();

      // 算最大的空间尺寸，放到nodeOptions配置项里面！
      if (!maxOldSpaceSize && !process.env.NEXT_DISABLE_MEM_OVERRIDE) {
        const totalMem = _os.default.totalmem();
        const totalMemInMB = Math.floor(totalMem / 1024 / 1024);
        maxOldSpaceSize = Math.floor(totalMemInMB * 0.5).toString();
        nodeOptions['max-old-space-size'] = maxOldSpaceSize;
        delete nodeOptions['max_old_space_size'];
      }
      // 默认开启源映射
      if (options.disableSourceMaps) {
        delete nodeOptions['enable-source-maps'];
      } else {
        nodeOptions['enable-source-maps'] = true;
      }
      // 如果用node进行debug的话，改一个端口
      if (nodeDebugType) {
        const address = (0, _utils.getParsedDebugAddress)();
        address.port = address.port + 1;
        nodeOptions[nodeDebugType] = (0, _utils.formatDebugAddress)(address);
      }

      // fork函数用于启动一个新的 Node.js 进程，并自动设置 IPC 通道。
      // fork函数入参为：
      // startServerPath是一个绝对路径：前面自己存放的文件夹\node_modules\next\dist\server\lib\start-server.js
      // 二参为包装后的【环境变量】！！
      child = (0, _child_process.fork)(startServerPath, {
        stdio: 'inherit',
        env: {
          ...defaultEnv,
          TURBOPACK: process.env.TURBOPACK,
          NEXT_PRIVATE_WORKER: '1',
          NEXT_PRIVATE_TRACE_ID: _shared.traceId,
          NODE_EXTRA_CA_CERTS: startServerOptions.selfSignedCertificate ? startServerOptions.selfSignedCertificate.rootCA : defaultEnv.NODE_EXTRA_CA_CERTS,
          NODE_OPTIONS: (0, _utils.formatNodeOptions)(nodeOptions),
          WATCHPACK_WATCHER_LIMIT: _os.default.platform() === 'darwin' ? '20' : undefined
        }
      });

      // 看下面TODO黄色标志的
      // 监听子进程的事件。
      child.on('message', (msg) => {
        // 入参msg是 { nextWorkerReady: true }

        if (msg && typeof msg === 'object') {
          if (msg.nextWorkerReady) {
            // 通过 IPC 通道向子进程发送消息。
            // 如果恰好此前的子进程已经 on('message', () => {}), 那么就会执行里面的回调函数
            // 子进程通过 process.on('message', ...) 接收并处理消息。
            child == null ? void 0 : child.send({
              nextWorkerOptions: startServerOptions
            });
            
          } else if (msg.nextServerReady && !resolved) {
            if (msg.port) {
              port = parseInt(msg.port, 10);
            }
            resolved = true;
            resolve();
          }
        }
      });
      child.on('exit', async (code, signal) => {
        if (sessionStopHandled || signal) {
          return;
        }
        if (code === _utils.RESTART_EXIT_CODE) {
          if (traceUploadUrl) {
            (0, _uploadtrace.default)({
              traceUploadUrl,
              mode: 'dev',
              projectDir: dir,
              distDir: config.distDir,
              isTurboSession,
              sync: true
            });
          }
          return startServer({
            ...startServerOptions,
            port
          });
        }
        await handleSessionStop(/* signal */ null);
      });
    });
  }

  const runDevServer = async (reboot) => {
    // 入参：reboot为false

    try {
      // 检查是否启用实验性 HTTPS 支持
      if (!!options.experimentalHttps) {
        _log.warn('Self-signed certificates are currently an experimental feature, use with caution.');

        // 拿到 HTTPS 所需要的私钥、证书和根证书，整合信息
        let certificate;
        const key = options.experimentalHttpsKey;
        const cert = options.experimentalHttpsCert;
        const rootCA = options.experimentalHttpsCa;
        if (key && cert) {
          certificate = {
            key: _path.default.resolve(key),
            cert: _path.default.resolve(cert),
            rootCA: rootCA ? _path.default.resolve(rootCA) : undefined
          };
        } else {
          certificate = await (0, _mkcert.createSelfSignedCertificate)(host);
        }
        // 启动开发服务器，传入certificate信息
        await startServer({
          ...devServerOptions,
          selfSignedCertificate: certificate
        });
      } else {
        // 没有https的话直接启动开发服务器
        await startServer(devServerOptions);
      }
      // 
      await preflight(reboot);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  await runDevServer(false);
};

//# sourceMappingURL=next-dev.js.map







// REVIEW - nextDev里面的函数





// 1. 验证和获取项目根目录路径的核心函数
function getProjectDir(dir, exitOnEnoent = true) {
  // 入参：
  // dir是undefined，exitOnEnoent是true

  // 将用户输入的目录（或默认当前目录）转换为绝对路径
  const resolvedDir = _path.default.resolve(dir || '.');
  try {
    // 获取路径的实际物理地址（解析符号链接、统一大小写）
    const realDir = (0, _realpath.realpathSync)(resolvedDir);
    if (resolvedDir !== realDir && resolvedDir.toLowerCase() === realDir.toLowerCase()) {
      (0, _log.warn)(`Invalid casing detected for project dir, received ${resolvedDir} actual path ${realDir}, see more info here https://nextjs.org/docs/messages/invalid-project-dir-casing`);
    }
    return realDir;
  } catch (err) {
    if (err.code === 'ENOENT' && exitOnEnoent) {
      if (typeof dir === 'string') {
        const detectedTypo = (0, _detecttypo.detectTypo)(dir, [
          'build',
          'dev',
          'info',
          'lint',
          'start',
          'telemetry',
          'experimental-test'
        ]);
        if (detectedTypo) {
          return (0, _utils.printAndExit)(`"next ${dir}" does not exist. Did you mean "next ${detectedTypo}"?`);
        }
      }
      return (0, _utils.printAndExit)(`Invalid project directory provided, no such directory: ${resolvedDir}`);
    }
    throw err;
  }
}




// 2. 检查文件夹是否合法
async function fileExists(fileName, type) {
  // fileName是根目录，type是"directory"
  // 前者是当前文件夹所在目录，后者是看当前的是一个文件还是一个文件夹

  try {
    if (type === "file") {
      const stats = await _fs.promises.stat(fileName);
      return stats.isFile();
    } else if (type === "directory") {
      // 把文件夹内容转化为二进制的buffer格式
      const stats = await _fs.promises.stat(fileName);
      // 
      return stats.isDirectory();
    }
    return (0, _fs.existsSync)(fileName);
  } catch (err) {
    if ((0, _iserror.default)(err) && (err.code === 'ENOENT' || err.code === 'ENAMETOOLONG')) {
      return false;
    }
    throw err;
  }
}

async function stat(path, options = { bigint: false }) {
  path = getValidatedPath(path);
  const result = await binding.stat(pathModule.toNamespacedPath(path), options.bigint, kUsePromises);
  return getStatsFromBinding(result);
}

function getStatsFromBinding(stats, offset = 0) {
  if (isBigInt64Array(stats)) {
    return new BigIntStats(
      stats[0 + offset], stats[1 + offset], stats[2 + offset],
      stats[3 + offset], stats[4 + offset], stats[5 + offset],
      stats[6 + offset], stats[7 + offset], stats[8 + offset],
      stats[9 + offset],
      nsFromTimeSpecBigInt(stats[10 + offset], stats[11 + offset]),
      nsFromTimeSpecBigInt(stats[12 + offset], stats[13 + offset]),
      nsFromTimeSpecBigInt(stats[14 + offset], stats[15 + offset]),
      nsFromTimeSpecBigInt(stats[16 + offset], stats[17 + offset]),
    );
  }
  return new Stats(
    stats[0 + offset], stats[1 + offset], stats[2 + offset],
    stats[3 + offset], stats[4 + offset], stats[5 + offset],
    stats[6 + offset], stats[7 + offset], stats[8 + offset],
    stats[9 + offset],
    msFromTimeSpec(stats[10 + offset], stats[11 + offset]),
    msFromTimeSpec(stats[12 + offset], stats[13 + offset]),
    msFromTimeSpec(stats[14 + offset], stats[15 + offset]),
    msFromTimeSpec(stats[16 + offset], stats[17 + offset]),
  );
}







// 3. 拿到next.config对象

async function loadConfig(phase, dir, { customConfig, rawConfig, silent = true, onLoadUserConfig, reactProductionProfiling } = {}) {
  // 环境监测！！
  if (!process.env.__NEXT_PRIVATE_RENDER_WORKER) {
    try {
      (0, _configutils.loadWebpackHook)();
    } catch (err) {
      if (!process.env.__NEXT_PRIVATE_STANDALONE_CONFIG) {
        throw err;
      }
    }
  }
  if (process.env.__NEXT_PRIVATE_STANDALONE_CONFIG) {
    return JSON.parse(process.env.__NEXT_PRIVATE_STANDALONE_CONFIG);
  }
  const curLog = silent ? {
    warn: () => { },
    info: () => { },
    error: () => { }
  } : _log;
  (0, _env.loadEnvConfig)(dir, phase === _constants.PHASE_DEVELOPMENT_SERVER, curLog);


  // 拼接本地目录和next.config.js文件名
  let configFileName = 'next.config.js';
  if (customConfig) {
    return assignDefaults(dir, {
      configOrigin: 'server',
      configFileName,
      ...customConfig
    }, silent);
  }

  // 拿到完整的配置文件路径
  const path = await (0, _findup.default)(_constants.CONFIG_FILES, {
    cwd: dir
  });
  if (process.env.__NEXT_TEST_MODE) {
    if (path) {
      _log.info(`Loading config from ${path}`);
    } else {
      _log.info('No config file found');
    }
  }

  // 拿到配置文件的exports对象！
  if (path == null ? void 0 : path.length) {
    var _userConfig_amp, _userConfig_experimental_turbo, _userConfig_experimental, _userConfig_experimental_turbo1, _userConfig_experimental1, _userConfig_experimental2;

    // configFileName 就是 next.config.js
    configFileName = (0, _path.basename)(path);
    let userConfigModule;

    // 拿到这个配置文件的exports对象，注意！用import异步导入的话，到时候要那结果对象的default属性
    try {
      const envBefore = Object.assign({}, process.env);
      if (process.env.__NEXT_TEST_MODE === 'jest') {
        userConfigModule = require(path);
      } else if (configFileName === 'next.config.ts') {
        userConfigModule = await (0, _transpileconfig.transpileConfig)({
          nextConfigPath: path,
          cwd: dir
        });
      } else {
        // 测试时是走这里
        userConfigModule = await import((0, _url.pathToFileURL)(path).href);
      }

      // 复制一份process.env出来
      const newEnv = {};
      for (const key of Object.keys(process.env)) {
        if (envBefore[key] !== process.env[key]) {
          newEnv[key] = process.env[key];
        }
      }
      // 更新环境变量！
      (0, _env.updateInitialEnv)(newEnv);
      if (rawConfig) {
        return userConfigModule;
      }
    } catch (err) {
      curLog.error(`Failed to load ${configFileName}, see more info here https://nextjs.org/docs/messages/next-config-error`);
      throw err;
    }


    // 处理userConfig（对用户自定义的配置对象进行标准化处理得到userConfig）
    const userConfig = await (0, _configshared.normalizeConfig)(phase, userConfigModule.default || userConfigModule);
    if (!process.env.NEXT_MINIMAL) {
      const { configSchema } = require('./config-schema');
      const state = configSchema.safeParse(userConfig);
      if (state.success === false) {
        const messages = [
          `Invalid ${configFileName} options detected: `
        ];
        const [errorMessages, shouldExit] = normalizeNextConfigZodErrors(state.error);
        for (const error of errorMessages) {
          messages.push(`    ${error}`);
        }
        messages.push('See more info here: https://nextjs.org/docs/messages/invalid-next-config');
        if (shouldExit) {
          for (const message of messages) {
            console.error(message);
          }
          await (0, _flushandexit.flushAndExit)(1);
        } else {
          for (const message of messages) {
            curLog.warn(message);
          }
        }
      }
    }
    if (userConfig.target && userConfig.target !== 'server') {
      throw Object.defineProperty(new Error(`The "target" property is no longer supported in ${configFileName}.\n` + 'See more info here https://nextjs.org/docs/messages/deprecated-target-config'), "__NEXT_ERROR_CODE", {
        value: "E478",
        enumerable: false,
        configurable: true
      });
    }
    if ((_userConfig_amp = userConfig.amp) == null ? void 0 : _userConfig_amp.canonicalBase) {
      const { canonicalBase } = userConfig.amp || {};
      userConfig.amp = userConfig.amp || {};
      userConfig.amp.canonicalBase = ((canonicalBase == null ? void 0 : canonicalBase.endsWith('/')) ? canonicalBase.slice(0, -1) : canonicalBase) || '';
    }
    if (reactProductionProfiling) {
      userConfig.reactProductionProfiling = reactProductionProfiling;
    }
    if (((_userConfig_experimental = userConfig.experimental) == null ? void 0 : (_userConfig_experimental_turbo = _userConfig_experimental.turbo) == null ? void 0 : _userConfig_experimental_turbo.loaders) && !((_userConfig_experimental1 = userConfig.experimental) == null ? void 0 : (_userConfig_experimental_turbo1 = _userConfig_experimental1.turbo) == null ? void 0 : _userConfig_experimental_turbo1.rules)) {
      curLog.warn('experimental.turbo.loaders is now deprecated. Please update next.config.js to use experimental.turbo.rules as soon as possible.\n' + 'The new option is similar, but the key should be a glob instead of an extension.\n' + 'Example: loaders: { ".mdx": ["mdx-loader"] } -> rules: { "*.mdx": ["mdx-loader"] }" }\n' + 'See more info here https://nextjs.org/docs/app/api-reference/next-config-js/turbo');
      const rules = {};
      for (const [ext, loaders] of Object.entries(userConfig.experimental.turbo.loaders)) {
        rules['*' + ext] = loaders;
      }
      userConfig.experimental.turbo.rules = rules;
    }
    if ((_userConfig_experimental2 = userConfig.experimental) == null ? void 0 : _userConfig_experimental2.useLightningcss) {
      var _css, _this;
      const { loadBindings } = require('next/dist/build/swc');
      const isLightningSupported = (_this = await loadBindings()) == null ? void 0 : (_css = _this.css) == null ? void 0 : _css.lightning;
      if (!isLightningSupported) {
        curLog.warn(`experimental.useLightningcss is set, but the setting is disabled because next-swc/wasm does not support it yet.`);
        userConfig.experimental.useLightningcss = false;
      }
    }
    if ((userConfig == null ? void 0 : userConfig.htmlLimitedBots) instanceof RegExp) {
      userConfig.htmlLimitedBots = userConfig.htmlLimitedBots.source;
    }
    onLoadUserConfig == null ? void 0 : onLoadUserConfig(userConfig);

    // 合并默认配置和自定义配置！
    const completeConfig = assignDefaults(dir, {
      configOrigin: (0, _path.relative)(dir, path),
      configFile: path,
      configFileName,
      ...userConfig
    }, silent);
    return completeConfig;

  } else {
    const configBaseName = (0, _path.basename)(_constants.CONFIG_FILES[0], (0, _path.extname)(_constants.CONFIG_FILES[0]));
    const unsupportedConfig = _findup.default.sync([
      `${configBaseName}.cjs`,
      `${configBaseName}.cts`,
      `${configBaseName}.mts`,
      `${configBaseName}.json`,
      `${configBaseName}.jsx`,
      `${configBaseName}.tsx`
    ], {
      cwd: dir
    });
    if (unsupportedConfig == null ? void 0 : unsupportedConfig.length) {
      throw Object.defineProperty(new Error(`Configuring Next.js via '${(0, _path.basename)(unsupportedConfig)}' is not supported. Please replace the file with 'next.config.js', 'next.config.mjs', or 'next.config.ts'.`), "__NEXT_ERROR_CODE", {
        value: "E203",
        enumerable: false,
        configurable: true
      });
    }
  }

  const completeConfig = assignDefaults(dir, _configshared.defaultConfig, silent);
  completeConfig.configFileName = configFileName;
  (0, _setuphttpagentenv.setHttpClientAndAgentOptions)(completeConfig);

  return completeConfig;
}








// REVIEW - startServer里面的函数————1：fork（启动一个新的nodeJS进程）





// 启动一个新的 Node.js 进程，并自动设置 IPC 通道。
function fork(modulePath, args = [], options) {
  // 入参：
  // modulePath是"D:\aa_frontEnd\next_practice\node_modules\next\dist\server\lib\start-server.js"
  // args是包装后的环境变量，属性包括如下：
  // stdio: 'inherit',
  // env: {
  //   ...defaultEnv,
  //   TURBOPACK: process.env.TURBOPACK,
  //   NEXT_PRIVATE_WORKER: '1',
  //   NEXT_PRIVATE_TRACE_ID: _shared.traceId,
  //   NODE_EXTRA_CA_CERTS: startServerOptions.selfSignedCertificate ? startServerOptions.selfSignedCertificate.rootCA : defaultEnv.NODE_EXTRA_CA_CERTS,
  //   NODE_OPTIONS: (0, _utils.formatNodeOptions)(nodeOptions),
  //   WATCHPACK_WATCHER_LIMIT: _os.default.platform() === 'darwin' ? '20' : undefined
  // }


  // 验证路径
  modulePath = getValidatedPath(modulePath, 'modulePath');


  // 转移【形式参数】
  // 把环境变量转移到options那里
  let execArgv;
  if (args == null) {
    args = [];
  } else if (typeof args === 'object' && !ArrayIsArray(args)) {
    options = args;
    args = [];
  } else {
    validateArray(args, 'args');
  }
  if (options != null) {
    validateObject(options, 'options');
  }


  // 包装options对象
  options = { __proto__: null, ...options, shell: false };
  // 检查当前的node版本是否合规
  // 这个execPath就是"D:\\Users\\lll\\AppData\\Local\\nvm\\v18.20.6\\node.exe"
  options.execPath = options.execPath || process.execPath;
  validateArgumentNullCheck(options.execPath, 'options.execPath');
  // 这个execArgv就是一个数组，里面的元素是当前debug的命令和端口号："--inspect-brk=9229"
  execArgv = options.execArgv || process.execArgv;
  validateArgumentsNullCheck(execArgv, 'options.execArgv');


  if (execArgv === process.execArgv && process._eval != null) {
    const index = ArrayPrototypeLastIndexOf(execArgv, process._eval);
    if (index > 0) {
      // Remove the -e switch to avoid fork bombing ourselves.
      execArgv = ArrayPrototypeSlice(execArgv);
      ArrayPrototypeSplice(execArgv, index - 1, 2);
    }
  }

  // 把modulePath和execArgv放到一起
  args = [...execArgv, modulePath, ...args];

  // options.stdio转化为数组？？？？为什么？？？？
  if (typeof options.stdio === 'string') {
    options.stdio = stdioStringToArray(options.stdio, 'ipc');
  } else if (!ArrayIsArray(options.stdio)) {
    options.stdio = stdioStringToArray(
      options.silent ? 'pipe' : 'inherit',
      'ipc');
  } else if (!ArrayPrototypeIncludes(options.stdio, 'ipc')) {
    throw new ERR_CHILD_PROCESS_IPC_REQUIRED('options.stdio');
  }

  // 创建一个子进程，然后进行一些属性的设置
  // 返回这个子进程
  return spawn(options.execPath, args, options);
}






// REVIEW - startServer里面的函数————2：spawn方法，创建一个子进程




function spawn(file, args, options) {
  // 入参：
  // options是包装后的环境变量对象
  // file是node执行exe
  // args是debug类型和server的源文件地址


  // 规范化与检验！
  options = normalizeSpawnArguments(file, args, options);
  validateTimeout(options.timeout);
  validateAbortSignal(options.signal, 'options.signal');
  // killSignal 是指当进程需要被杀死时使用的信号（如 SIGTERM、SIGKILL 等）。
  const killSignal = sanitizeKillSignal(options.killSignal);

  // 创建了一个 ChildProcess 实例，用于管理子进程的类
  const child = new ChildProcess();

  debug('spawn', options);

  // spawn 方法会根据给定的选项启动一个新的子进程。
  child.spawn(options);

  // 如果超时发生，会尝试结束子进程。
  if (options.timeout > 0) {
    let timeoutId = setTimeout(() => {
      if (timeoutId) {
        try {
          child.kill(killSignal);
        } catch (err) {
          child.emit('error', err);
        }
        timeoutId = null;
      }
    }, options.timeout);

    // 监听子进程的 exit 事件。如果子进程退出，清除定时器 timeoutId，防止超时逻辑继续执行。
    child.once('exit', () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });
  }

  // 执行相关的信号监听和中止处理。
  if (options.signal) {
    const signal = options.signal;
    if (signal.aborted) {
      // 如果 signal 被中止了
      // 确保该回调函数在当前事件循环的下一个“tick”时被调用。
      process.nextTick(onAbortListener);

    } else {
      // 如果 signal 没有被中止，为 signal 添加中止监听器
      addAbortListener ??= require('events').addAbortListener;
      const disposable = addAbortListener(signal, onAbortListener);
      // 当子进程退出时，移除 addAbortListener 返回的清理函数
      child.once('exit', disposable[SymbolDispose]);
    }

    function onAbortListener() {
      abortChildProcess(child, killSignal, options.signal.reason);
    }
  }

  return child;
}





function ChildProcess() {
  FunctionPrototypeCall(EventEmitter, this);

  this._closesNeeded = 1;
  this._closesGot = 0;
  this.connected = false;

  this.signalCode = null;
  this.exitCode = null;
  this.killed = false;
  this.spawnfile = null;

  this._handle = new Process();
  this._handle[owner_symbol] = this;

  this._handle.onexit = (exitCode, signalCode) => {
    if (signalCode) {
      this.signalCode = signalCode;
    } else {
      this.exitCode = exitCode;
    }

    if (this.stdin) {
      this.stdin.destroy();
    }

    this._handle.close();
    this._handle = null;

    if (exitCode < 0) {
      const syscall = this.spawnfile ? 'spawn ' + this.spawnfile : 'spawn';
      const err = errnoException(exitCode, syscall);

      if (this.spawnfile)
        err.path = this.spawnfile;

      err.spawnargs = ArrayPrototypeSlice(this.spawnargs, 1);
      this.emit('error', err);
    } else {
      this.emit('exit', this.exitCode, this.signalCode);
    }

    process.nextTick(flushStdio, this);

    maybeClose(this);
  };
}



// 启动一个新的子进程。
ChildProcess.prototype.spawn = function (options) {
  let i = 0;

  validateObject(options, 'options');

  // stdio是 进程的输入输出设置
  // 在这里stdio长这样：[0, 1, 2, 'ipc']
  let stdio = options.stdio || 'pipe';

  // 改造封装stdio为一个数组，里面有四个属性
  // {type: 'fd', fd: 0}
  // {type: 'fd', fd: 1}
  // {type: 'fd', fd: 2}
  // {type: 'pipe', handle: Pipe, ipc: true}
  // 获取 IPC（进程间通信）配置以及 IPC 文件描述符（ipcFd）
  stdio = getValidStdio(stdio, false);
  const ipc = stdio.ipc;
  const ipcFd = stdio.ipcFd;
  stdio = options.stdio = stdio.stdio;


  // 序列化模式检查（验证 serialization 是否为 undefined、json 或 advanced 之一）
  validateOneOf(options.serialization, 'options.serialization', [undefined, 'json', 'advanced']);
  const serialization = options.serialization || 'json';

  // IPC 验证
  if (ipc !== undefined) {
    if (options.envPairs === undefined)
      options.envPairs = [];
    else
      validateArray(options.envPairs, 'options.envPairs');

    ArrayPrototypePush(options.envPairs, `NODE_CHANNEL_FD=${ipcFd}`);
    ArrayPrototypePush(options.envPairs, `NODE_CHANNEL_SERIALIZATION_MODE=${serialization}`);
  }

  // 拿到【要执行的文件路径 spawnfile】和【命令行参数 spawnargs】
  validateString(options.file, 'options.file');
  this.spawnfile = options.file;
  if (options.args === undefined) {
    this.spawnargs = [];
  } else {
    validateArray(options.args, 'options.args');
    this.spawnargs = options.args;
  }

  // 调用原生process.spawn 方法
  // 这个应该是异步的吧
  const err = this._handle.spawn(options);

  // 错误处理
  if (err === UV_EACCES ||
    err === UV_EAGAIN ||
    err === UV_EMFILE ||
    err === UV_ENFILE ||
    err === UV_ENOENT) {
    process.nextTick(onErrorNT, this, err);

    if (err === UV_EMFILE || err === UV_ENFILE)
      return err;
  } else if (err) {
    for (i = 0; i < stdio.length; i++) {
      const stream = stdio[i];
      if (stream.type === 'pipe') {
        stream.handle.close();
      }
    }
    this._handle.close();
    this._handle = null;
    throw errnoException(err, 'spawn');
  } else {
    process.nextTick(onSpawnNT, this);
  }


  // PID 和文件描述符设置
  this.pid = this._handle.pid;
  for (i = 0; i < stdio.length; i++) {
    const stream = stdio[i];
    if (stream.type === 'ignore') continue;

    // 是 IPC 类型，增加 this._closesNeeded 计数
    if (stream.ipc) {
      this._closesNeeded++;
      continue;
    }

    // 是 wrap 类型，停止其读取状态，并暂停流
    if (stream.type === 'wrap') {
      stream.handle.reading = false;
      stream.handle.readStop();
      stream._stdio.pause();
      stream._stdio.readableFlowing = false;
      stream._stdio._readableState.reading = false;
      stream._stdio[kIsUsedAsStdio] = true;
      continue;
    }

    // 如果流有句柄，则创建一个 socket，连接到子进程的标准输入输出。
    if (stream.handle) {
      stream.socket = createSocket(this.pid !== 0 ?
        stream.handle : null, i > 0);

      if (i > 0 && this.pid !== 0) {
        this._closesNeeded++;
        stream.socket.on('close', () => {
          maybeClose(this);
        });
      }
    }
  }

  // 设置标准输入输出
  this.stdin = stdio.length >= 1 && stdio[0].socket !== undefined ?
    stdio[0].socket : null;
  this.stdout = stdio.length >= 2 && stdio[1].socket !== undefined ?
    stdio[1].socket : null;
  this.stderr = stdio.length >= 3 && stdio[2].socket !== undefined ?
    stdio[2].socket : null;


  // 回调和清理 
  this.stdio = [];
  for (i = 0; i < stdio.length; i++)
    ArrayPrototypePush(this.stdio, stdio[i].socket === undefined ? null : stdio[i].socket);
  
  // 为实例加上很多个方法！！
  if (ipc !== undefined) setupChannel(this, ipc, serialization);

  return err;
}




// REVIEW - 子进程实例的方法初始化函数（包含child.send方法）




function setupChannel(target, channel, serializationMode) {
  const control = new Control(channel);
  target.channel = control;
  target[kChannelHandle] = channel;

  ObjectDefineProperty(target, '_channel', {
    __proto__: null,
    get: deprecate(() => {
      return target.channel;
    }, channelDeprecationMsg, 'DEP0129'),
    set: deprecate((val) => {
      target.channel = val;
    }, channelDeprecationMsg, 'DEP0129'),
    configurable: true,
    enumerable: false,
  });

  target._handleQueue = null;
  target._pendingMessage = null;

  if (serialization === undefined)
    serialization = require('internal/child_process/serialization');
  const {
    initMessageChannel,
    parseChannelMessages,
    writeChannelMessage,
  } = serialization[serializationMode];

  let pendingHandle = null;
  initMessageChannel(channel);
  channel.pendingHandle = null;
  channel.onread = function (arrayBuffer) {
    const recvHandle = channel.pendingHandle;
    channel.pendingHandle = null;
    if (arrayBuffer) {
      const nread = streamBaseState[kReadBytesOrError];
      const offset = streamBaseState[kArrayBufferOffset];
      const pool = new Uint8Array(arrayBuffer, offset, nread);
      if (recvHandle)
        pendingHandle = recvHandle;

      for (const message of parseChannelMessages(channel, pool)) {
        // There will be at most one NODE_HANDLE message in every chunk we
        // read because SCM_RIGHTS messages don't get coalesced. Make sure
        // that we deliver the handle with the right message however.
        if (isInternal(message)) {
          if (message.cmd === 'NODE_HANDLE') {
            handleMessage(message, pendingHandle, true);
            pendingHandle = null;
          } else {
            handleMessage(message, undefined, true);
          }
        } else {
          handleMessage(message, undefined, false);
        }
      }
    } else {
      this.buffering = false;
      target.disconnect();
      channel.onread = nop;
      channel.close();
      target.channel = null;
      maybeClose(target);
    }
  };

  // Object where socket lists will live
  channel.sockets = { got: {}, send: {} };

  // Handlers will go through this
  target.on('internalMessage', function (message, handle) {
    // Once acknowledged - continue sending handles.
    if (message.cmd === 'NODE_HANDLE_ACK' ||
      message.cmd === 'NODE_HANDLE_NACK') {

      if (target._pendingMessage) {
        if (message.cmd === 'NODE_HANDLE_ACK') {
          closePendingHandle(target);
        } else if (target._pendingMessage.retransmissions++ ===
          MAX_HANDLE_RETRANSMISSIONS) {
          closePendingHandle(target);
          process.emitWarning('Handle did not reach the receiving process ' +
            'correctly', 'SentHandleNotReceivedWarning');
        }
      }

      assert(ArrayIsArray(target._handleQueue));
      const queue = target._handleQueue;
      target._handleQueue = null;

      if (target._pendingMessage) {
        target._send(target._pendingMessage.message,
          target._pendingMessage.handle,
          target._pendingMessage.options,
          target._pendingMessage.callback);
      }

      for (let i = 0; i < queue.length; i++) {
        const args = queue[i];
        target._send(args.message, args.handle, args.options, args.callback);
      }

      // Process a pending disconnect (if any).
      if (!target.connected && target.channel && !target._handleQueue)
        target._disconnect();

      return;
    }

    if (message.cmd !== 'NODE_HANDLE') return;

    // It is possible that the handle is not received because of some error on
    // ancillary data reception such as MSG_CTRUNC. In this case, report the
    // sender about it by sending a NODE_HANDLE_NACK message.
    if (!handle)
      return target._send({ cmd: 'NODE_HANDLE_NACK' }, null, true);

    // Acknowledge handle receival. Don't emit error events (for example if
    // the other side has disconnected) because this call to send() is not
    // initiated by the user and it shouldn't be fatal to be unable to ACK
    // a message.
    target._send({ cmd: 'NODE_HANDLE_ACK' }, null, true);

    const obj = handleConversion[message.type];

    // Update simultaneous accepts on Windows
    if (process.platform === 'win32') {
      handle.setSimultaneousAccepts(false);
    }

    // Convert handle object
    obj.got.call(this, message, handle, (handle) => {
      handleMessage(message.msg, handle, isInternal(message.msg));
    });
  });


  target.on('newListener', function () {

    process.nextTick(() => {
      if (!target.channel || !target.listenerCount('message'))
        return;

      const messages = target.channel[kPendingMessages];
      const { length } = messages;
      if (!length) return;

      for (let i = 0; i < length; i++) {
        ReflectApply(target.emit, target, messages[i]);
      }

      target.channel[kPendingMessages] = [];
    });
  });


  // TODO - send函数在这里！！！！
  target.send = function (message, handle, options, callback) {
    // 入参：
    // message长这样：
    // nextWorkerOptions:
    //   allowRetry: true
    //   dir: "D:\\aa_frontEnd\\next_practice"
    //   hostname: undefined
    //   isDev: true
    //   port: 3000
    // 后面三个参数都是undefined

    if (typeof handle === 'function') {
      callback = handle;
      handle = undefined;
      options = undefined;
    } else if (typeof options === 'function') {
      callback = options;
      options = undefined;
    } else if (options !== undefined) {
      validateObject(options, 'options');
    }

    options = { swallowErrors: false, ...options };

    if (this.connected) {
      // 执行下面的_send方法
      return this._send(message, handle, options, callback);
    }

    const ex = new ERR_IPC_CHANNEL_CLOSED();
    if (typeof callback === 'function') {
      process.nextTick(callback, ex);
    } else {
      process.nextTick(() => this.emit('error', ex));
    }
    return false;
  };


  target._send = function (message, handle, options, callback) {
    assert(this.connected || this.channel);

    // 数据验证与标准化
    if (message === undefined)
      throw new ERR_MISSING_ARGS('message');

    if (typeof message !== 'string' &&
      typeof message !== 'object' &&
      typeof message !== 'number' &&
      typeof message !== 'boolean') {
      throw new ERR_INVALID_ARG_TYPE('message', ['string', 'object', 'number', 'boolean'], message);
    }

    if (typeof options === 'boolean') {
      options = { swallowErrors: options };
    }

    let obj;

    // handle为undefined
    if (handle) {
      // 如果提供了 handle 参数，将消息格式化为包含句柄类型和原始消息的对象。
      message = {
        cmd: 'NODE_HANDLE',
        type: null,
        msg: message,
      };

      if (handle instanceof net.Socket) {
        message.type = 'net.Socket';
      } else if (handle instanceof net.Server) {
        message.type = 'net.Server';
      } else if (handle instanceof TCP || handle instanceof Pipe) {
        message.type = 'net.Native';
      } else if (handle instanceof dgram.Socket) {
        message.type = 'dgram.Socket';
      } else if (handle instanceof UDP) {
        message.type = 'dgram.Native';
      } else {
        throw new ERR_INVALID_HANDLE_TYPE();
      }

      // 如果存在句柄队列（_handleQueue），将当前消息和句柄加入队列。
      if (this._handleQueue) {
        ArrayPrototypePush(this._handleQueue, {
          callback: callback,
          handle: handle,
          options: options,
          message: message.msg,
        });
        return this._handleQueue.length === 1;
      }

      obj = handleConversion[message.type];

      // 根据句柄类型，调用相应的转换函数（handleConversion[message.type].send）将句柄转换为可发送的格式。
      handle = ReflectApply(handleConversion[message.type].send,
        target, [message, handle, options]);

      if (!handle)
        message = message.msg;

      // Update simultaneous accepts on Windows
      if (obj.simultaneousAccepts && process.platform === 'win32') {
        handle.setSimultaneousAccepts(true);
      }
    } else if (this._handleQueue && !(message && (message.cmd === 'NODE_HANDLE_ACK' || message.cmd === 'NODE_HANDLE_NACK'))) {
      // 如果没有句柄，但存在句柄队列，将消息加入队列。
      ArrayPrototypePush(this._handleQueue, {
        callback: callback,
        handle: null,
        options: options,
        message: message,
      });
      return this._handleQueue.length === 1;
    }


    // 创建一个 WriteWrap 对象，用于管理写入操作。
    // 调用 writeChannelMessage 将消息写入 IPC 通道。
    const req = new WriteWrap();
    const err = writeChannelMessage(channel, req, message, handle);
    const wasAsyncWrite = streamBaseState[kLastWriteWasAsync];


    // 写入结果处理
    if (err === 0) {
      // 写入成功处理
      if (handle) {
        if (!this._handleQueue)
          this._handleQueue = [];
        if (obj && obj.postSend)
          obj.postSend(message, handle, options, callback, target);
      }

      if (wasAsyncWrite) {
        // 如果是异步写入，设置 oncomplete 回调。
        req.oncomplete = () => {
          control.unrefCounted();
          if (typeof callback === 'function')
            callback(null);
        };
        control.refCounted();
      } else if (typeof callback === 'function') {
        process.nextTick(callback, null);
      }

    } else {
      // 写入失败处理
      if (obj && obj.postSend)
        obj.postSend(message, handle, options, callback);
      if (!options.swallowErrors) {
        const ex = errnoException(err, 'write');
        if (typeof callback === 'function') {
          process.nextTick(callback, ex);
        } else {
          process.nextTick(() => this.emit('error', ex));
        }
      }
    }

    // 返回写入队列的大小是否小于阈值（65536 * 2），用于控制流量。
    return channel.writeQueueSize < (65536 * 2);
  };

  target.connected = true;

  target.disconnect = function () {
    if (!this.connected) {
      this.emit('error', new ERR_IPC_DISCONNECTED());
      return;
    }

    // Do not allow any new messages to be written.
    this.connected = false;

    // If there are no queued messages, disconnect immediately. Otherwise,
    // postpone the disconnect so that it happens internally after the
    // queue is flushed.
    if (!this._handleQueue)
      this._disconnect();
  };

  target._disconnect = function () {
    assert(this.channel);

    // This marks the fact that the channel is actually disconnected.
    this.channel = null;
    this[kChannelHandle] = null;

    if (this._pendingMessage)
      closePendingHandle(this);

    let fired = false;
    function finish() {
      if (fired) return;
      fired = true;

      channel.close();
      target.emit('disconnect');
    }

    // If a message is being read, then wait for it to complete.
    if (channel.buffering) {
      this.once('message', finish);
      this.once('internalMessage', finish);

      return;
    }

    process.nextTick(finish);
  };

  function emit(event, message, handle) {
    if ('internalMessage' === event || target.listenerCount('message')) {
      target.emit(event, message, handle);
      return;
    }

    ArrayPrototypePush(
      target.channel[kPendingMessages],
      [event, message, handle],
    );
  }

  function handleMessage(message, handle, internal) {
    if (!target.channel)
      return;

    const eventName = (internal ? 'internalMessage' : 'message');

    process.nextTick(emit, eventName, message, handle);
  }

  channel.readStart();
  return control;
}






// REVIEW - start-server文件，但是不知道从哪里进来的
// node inspect ./node_modules/next/dist/server/lib/start-server.js





Object.defineProperty(exports, "__esModule", {
  value: true
});
0 && (module.exports = {
  getRequestHandlers: null,
  startServer: null
});
function _export(target, all) {
  for (var name in all) Object.defineProperty(target, name, {
    enumerable: true,
    get: all[name]
  });
}
_export(exports, {
  getRequestHandlers: function () {
    return getRequestHandlers;
  },
  startServer: function () {
    return startServer;
  }
});
const _getnetworkhost = require("../../lib/get-network-host");
require("../next");
require("../require-hook");
const _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
const _v8 = /*#__PURE__*/ _interop_require_default(require("v8"));
const _path = /*#__PURE__*/ _interop_require_default(require("path"));
const _http = /*#__PURE__*/ _interop_require_default(require("http"));
const _https = /*#__PURE__*/ _interop_require_default(require("https"));
const _os = /*#__PURE__*/ _interop_require_default(require("os"));
const _watchpack = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/watchpack"));
const _log = /*#__PURE__*/ _interop_require_wildcard(require("../../build/output/log"));
const _debug = /*#__PURE__*/ _interop_require_default(require("next/dist/compiled/debug"));
const _utils = require("./utils");
const _formathostname = require("./format-hostname");
const _routerserver = require("./router-server");
const _constants = require("../../shared/lib/constants");
const _appinfolog = require("./app-info-log");
const _turbopackwarning = require("../../lib/turbopack-warning");
const _trace = require("../../trace");
const _ispostpone = require("./router-utils/is-postpone");
const _isipv6 = require("./is-ipv6");
const _asynccallbackset = require("./async-callback-set");
function _interop_require_default(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}
function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function (nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return {
      default: obj
    };
  }
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {
    __proto__: null
  };
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
if (performance.getEntriesByName('next-start').length === 0) {
  performance.mark('next-start');
}
const debug = (0, _debug.default)('next:start-server');
let startServerSpan;
async function getRequestHandlers({ dir, port, isDev, onDevServerCleanup, server, hostname, minimalMode, keepAliveTimeout, experimentalHttpsServer, quiet }) {
  return (0, _routerserver.initialize)({
    dir,
    port,
    hostname,
    onDevServerCleanup,
    dev: isDev,
    minimalMode,
    server,
    keepAliveTimeout,
    experimentalHttpsServer,
    startServerSpan,
    quiet
  });
}
async function startServer(serverOptions) {
  const { dir, isDev, hostname, minimalMode, allowRetry, keepAliveTimeout, selfSignedCertificate } = serverOptions;
  let { port } = serverOptions;
  process.title = `next-server (v${"15.2.4"})`;
  let handlersReady = () => { };
  let handlersError = () => { };
  let handlersPromise = new Promise((resolve, reject) => {
    handlersReady = resolve;
    handlersError = reject;
  });
  let requestHandler = async (req, res) => {
    if (handlersPromise) {
      await handlersPromise;
      return requestHandler(req, res);
    }
    throw Object.defineProperty(new Error('Invariant request handler was not setup'), "__NEXT_ERROR_CODE", {
      value: "E287",
      enumerable: false,
      configurable: true
    });
  };
  let upgradeHandler = async (req, socket, head) => {
    if (handlersPromise) {
      await handlersPromise;
      return upgradeHandler(req, socket, head);
    }
    throw Object.defineProperty(new Error('Invariant upgrade handler was not setup'), "__NEXT_ERROR_CODE", {
      value: "E290",
      enumerable: false,
      configurable: true
    });
  };
  let nextServer;
  // setup server listener as fast as possible
  if (selfSignedCertificate && !isDev) {
    throw Object.defineProperty(new Error('Using a self signed certificate is only supported with `next dev`.'), "__NEXT_ERROR_CODE", {
      value: "E128",
      enumerable: false,
      configurable: true
    });
  }
  async function requestListener(req, res) {
    try {
      if (handlersPromise) {
        await handlersPromise;
        handlersPromise = undefined;
      }
      await requestHandler(req, res);
    } catch (err) {
      res.statusCode = 500;
      res.end('Internal Server Error');
      _log.error(`Failed to handle request for ${req.url}`);
      console.error(err);
    } finally {
      if (isDev) {
        if (_v8.default.getHeapStatistics().used_heap_size > 0.8 * _v8.default.getHeapStatistics().heap_size_limit) {
          _log.warn(`Server is approaching the used memory threshold, restarting...`);
          (0, _trace.trace)('server-restart-close-to-memory-threshold', undefined, {
            'memory.heapSizeLimit': String(_v8.default.getHeapStatistics().heap_size_limit),
            'memory.heapUsed': String(_v8.default.getHeapStatistics().used_heap_size)
          }).stop();
          await (0, _trace.flushAllTraces)();
          process.exit(_utils.RESTART_EXIT_CODE);
        }
      }
    }
  }
  const server = selfSignedCertificate ? _https.default.createServer({
    key: _fs.default.readFileSync(selfSignedCertificate.key),
    cert: _fs.default.readFileSync(selfSignedCertificate.cert)
  }, requestListener) : _http.default.createServer(requestListener);
  if (keepAliveTimeout) {
    server.keepAliveTimeout = keepAliveTimeout;
  }
  server.on('upgrade', async (req, socket, head) => {
    try {
      await upgradeHandler(req, socket, head);
    } catch (err) {
      socket.destroy();
      _log.error(`Failed to handle request for ${req.url}`);
      console.error(err);
    }
  });
  let portRetryCount = 0;
  server.on('error', (err) => {
    if (allowRetry && port && isDev && err.code === 'EADDRINUSE' && portRetryCount < 10) {
      _log.warn(`Port ${port} is in use, trying ${port + 1} instead.`);
      port += 1;
      portRetryCount += 1;
      server.listen(port, hostname);
    } else {
      _log.error(`Failed to start server`);
      console.error(err);
      process.exit(1);
    }
  });
  let cleanupListeners = isDev ? new _asynccallbackset.AsyncCallbackSet() : undefined;
  await new Promise((resolve) => {
    server.on('listening', async () => {
      const nodeDebugType = (0, _utils.getNodeDebugType)();
      const addr = server.address();
      const actualHostname = (0, _formathostname.formatHostname)(typeof addr === 'object' ? (addr == null ? void 0 : addr.address) || hostname || 'localhost' : addr);
      const formattedHostname = !hostname || actualHostname === '0.0.0.0' ? 'localhost' : actualHostname === '[::]' ? '[::1]' : (0, _formathostname.formatHostname)(hostname);
      port = typeof addr === 'object' ? (addr == null ? void 0 : addr.port) || port : port;
      const networkHostname = hostname ?? (0, _getnetworkhost.getNetworkHost)((0, _isipv6.isIPv6)(actualHostname) ? 'IPv6' : 'IPv4');
      const protocol = selfSignedCertificate ? 'https' : 'http';
      const networkUrl = networkHostname ? `${protocol}://${(0, _formathostname.formatHostname)(networkHostname)}:${port}` : null;
      const appUrl = `${protocol}://${formattedHostname}:${port}`;
      if (nodeDebugType) {
        const formattedDebugAddress = (0, _utils.getFormattedDebugAddress)();
        _log.info(`the --${nodeDebugType} option was detected, the Next.js router server should be inspected at ${formattedDebugAddress}.`);
      }
      // Store the selected port to:
      // - expose it to render workers
      // - re-use it for automatic dev server restarts with a randomly selected port
      process.env.PORT = port + '';
      process.env.__NEXT_PRIVATE_ORIGIN = appUrl;
      // Only load env and config in dev to for logging purposes
      let envInfo;
      let experimentalFeatures;
      if (isDev) {
        const startServerInfo = await (0, _appinfolog.getStartServerInfo)(dir, isDev);
        envInfo = startServerInfo.envInfo;
        experimentalFeatures = startServerInfo.experimentalFeatures;
      }
      (0, _appinfolog.logStartInfo)({
        networkUrl,
        appUrl,
        envInfo,
        experimentalFeatures,
        maxExperimentalFeatures: 3
      });
      _log.event(`Starting...`);
      try {
        let cleanupStarted = false;
        let closeUpgraded = null;
        const cleanup = () => {
          if (cleanupStarted) {
            // We can get duplicate signals, e.g. when `ctrl+c` is used in an
            // interactive shell (i.e. bash, zsh), the shell will recursively
            // send SIGINT to children. The parent `next-dev` process will also
            // send us SIGINT.
            return;
          }
          cleanupStarted = true;
          (async () => {
            debug('start-server process cleanup');
            // first, stop accepting new connections and finish pending requests,
            // because they might affect `nextServer.close()` (e.g. by scheduling an `after`)
            await new Promise((res) => {
              server.close((err) => {
                if (err) console.error(err);
                res();
              });
              if (isDev) {
                server.closeAllConnections();
                closeUpgraded == null ? void 0 : closeUpgraded();
              }
            });
            // now that no new requests can come in, clean up the rest
            await Promise.all([
              nextServer == null ? void 0 : nextServer.close().catch(console.error),
              cleanupListeners == null ? void 0 : cleanupListeners.runAll().catch(console.error)
            ]);
            debug('start-server process cleanup finished');
            process.exit(0);
          })();
        };
        const exception = (err) => {
          if ((0, _ispostpone.isPostpone)(err)) {
            // React postpones that are unhandled might end up logged here but they're
            // not really errors. They're just part of rendering.
            return;
          }
          // This is the render worker, we keep the process alive
          console.error(err);
        };
        // Make sure commands gracefully respect termination signals (e.g. from Docker)
        // Allow the graceful termination to be manually configurable
        if (!process.env.NEXT_MANUAL_SIG_HANDLE) {
          process.on('SIGINT', cleanup);
          process.on('SIGTERM', cleanup);
        }
        process.on('rejectionHandled', () => {
          // It is ok to await a Promise late in Next.js as it allows for better
          // prefetching patterns to avoid waterfalls. We ignore loggining these.
          // We should've already errored in anyway unhandledRejection.
        });
        process.on('uncaughtException', exception);
        process.on('unhandledRejection', exception);
        const initResult = await getRequestHandlers({
          dir,
          port,
          isDev,
          onDevServerCleanup: cleanupListeners ? cleanupListeners.add.bind(cleanupListeners) : undefined,
          server,
          hostname,
          minimalMode,
          keepAliveTimeout,
          experimentalHttpsServer: !!selfSignedCertificate
        });
        requestHandler = initResult.requestHandler;
        upgradeHandler = initResult.upgradeHandler;
        nextServer = initResult.server;
        closeUpgraded = initResult.closeUpgraded;
        const startServerProcessDuration = performance.mark('next-start-end') && performance.measure('next-start-duration', 'next-start', 'next-start-end').duration;
        handlersReady();
        const formatDurationText = startServerProcessDuration > 2000 ? `${Math.round(startServerProcessDuration / 100) / 10}s` : `${Math.round(startServerProcessDuration)}ms`;
        _log.event(`Ready in ${formatDurationText}`);
        if (process.env.TURBOPACK) {
          await (0, _turbopackwarning.validateTurboNextConfig)({
            dir: serverOptions.dir,
            isDev: true
          });
        }
      } catch (err) {
        // fatal error if we can't setup
        handlersError();
        console.error(err);
        process.exit(1);
      }
      resolve();
    });
    server.listen(port, hostname);
  });
  if (isDev) {
    function watchConfigFiles(dirToWatch, onChange) {
      const wp = new _watchpack.default();
      wp.watch({
        files: _constants.CONFIG_FILES.map((file) => _path.default.join(dirToWatch, file))
      });
      wp.on('change', onChange);
    }
    watchConfigFiles(dir, async (filename) => {
      if (process.env.__NEXT_DISABLE_MEMORY_WATCHER) {
        _log.info(`Detected change, manual restart required due to '__NEXT_DISABLE_MEMORY_WATCHER' usage`);
        return;
      }
      _log.warn(`Found a change in ${_path.default.basename(filename)}. Restarting the server to apply the changes...`);
      process.exit(_utils.RESTART_EXIT_CODE);
    });
  }
}
if (process.env.NEXT_PRIVATE_WORKER && process.send) {
  process.addListener('message', async (msg) => {
    if (msg && typeof msg === 'object' && msg.nextWorkerOptions && process.send) {
      startServerSpan = (0, _trace.trace)('start-dev-server', undefined, {
        cpus: String(_os.default.cpus().length),
        platform: _os.default.platform(),
        'memory.freeMem': String(_os.default.freemem()),
        'memory.totalMem': String(_os.default.totalmem()),
        'memory.heapSizeLimit': String(_v8.default.getHeapStatistics().heap_size_limit)
      });
      await startServerSpan.traceAsyncFn(() => startServer(msg.nextWorkerOptions));
      const memoryUsage = process.memoryUsage();
      startServerSpan.setAttribute('memory.rss', String(memoryUsage.rss));
      startServerSpan.setAttribute('memory.heapTotal', String(memoryUsage.heapTotal));
      startServerSpan.setAttribute('memory.heapUsed', String(memoryUsage.heapUsed));
      process.send({
        nextServerReady: true,
        port: process.env.PORT
      });
    }
  });
  process.send({
    nextWorkerReady: true
  });
}

//# sourceMappingURL=start-server.js.map