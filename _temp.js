#!/usr/bin/env node
/* global process */
/* eslint-disable no-unused-vars, no-unreachable, no-constant-condition */
import { setContinousNetworkTryCount, getContinousNetworkTryCount, aiChat, geminiChat, anthropicChat, groqChat, openaiChat, ollamaChat, turnOnOllamaAndGetModelList, combindMessageHistory, code_generator, getModelName, getContextWindowSize, resultTemplate, axiosPostWrap, ask_prompt_text, isModelLlamas } from './aiFeatures.js'
import { makePreprocessingCode, shell_exec, execInVenv, attatchWatcher, execAdv, execPlain, getPowerShellPath, moduleValidator, generateModuleInstallCode, neededPackageOfCode, procPlainText } from './codeExecution.js'
import { isCorrectCode, code_validator, makeVEnvCmd } from './codeModifiers.js'
import { printError, isBadStr, addslashes, getCurrentDateTime, is_dir, is_file, isItem, splitStringIntoTokens, measureColumns, isWindows, promptChoices, isElectron } from './commons.js'
import { createVENV, disableAllVariable, disableVariable, getRCPath, readRCDaata, getVarVal, findMissingVars, isKeyInConfig, setVarVal } from './configuration.js'
import { threeticks, threespaces, disableOra, limitline, annn, responseTokenRatio, preprocessing, traceError, contextWindows, colors, forignLanguage, greetings, howAreYou, whatAreYouDoing, langtable } from './constants.js'
import { installProcess, realworld_which_python, which, getPythonVenvPath, getActivatePath, getPythonPipPath, venvCandidatePath, checkPythonForTermination, installModules } from './envLoaders.js'
import { oraSucceed, oraFail, oraStop, oraStart, oraBackupAndStopCurrent, print } from './oraManager.js'
import { resetHistory, addMessages, addHistory, summarize, resultAssigning, defineNewMission, assignNewPrompt, errorPromptHandle, } from './promptManager.js'
import { mainApp, } from './mainLogic.js'
import promptTemplate from './translationPromptTemplate.js';
import singleton from './singleton.js';
import chalk from 'chalk';
import { highlight } from 'cli-highlight';
import axios from 'axios';
import shelljs from 'shelljs';
import readline from 'readline';
import path from 'path';
import fs from 'fs';
import ora from 'ora';
import boxen from 'boxen';
import readlineSync from 'readline-sync';
import figlet from 'figlet';
import { fileURLToPath } from 'url';
import { Command } from 'commander';
import { promises as fsPromises } from 'fs';
import os from 'os';
import open from 'open';
// import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VERSION = '1.0.152'; // version

const apiMethods = {
    async getstate(body) {
        const venv_path = await getPythonVenvPath();
        if (venv_path) {
            let statefile = `${venv_path}/${body.filename}`;
            let data = await fsPromises.readFile(statefile);
            return data.toString();
        }
    },
    async getstatelist() {
        const venv_path = await getPythonVenvPath();
        if (venv_path) {
            let list = await fsPromises.readdir(venv_path);
            return list.filter(file => {
                return file.startsWith('state_') && file.endsWith('.json')
            }).sort((a, b) => {
                if (a > b) return -1;
                if (a < b) return 1;
                return 0;
            });
        }
        return [];
    },
    async savestate(body) {
        const venv_path = await getPythonVenvPath();
        if (venv_path) {
            let statefile = `${venv_path}/state_${body.sessionDate}.json`;
            await fsPromises.writeFile(statefile, JSON.stringify(body.state));
        }
        // body.state
    },
    async resetconfig(body) {
        // node index.js -a resetconfig
        await disableAllVariable();
    },
    async which(body) {
        // body.value
        let ollamaPath = (await which(body.value)).trim();
        return ollamaPath;
    },
    async isBadStr(body) {
        // body.value
        return isBadStr(body.value);
    },
    async disableVariable(body) {
        // body.value
        await disableVariable(body.value);
    },
    async open(body) {
        // body.value
        await open(body.value);
    },
    async isKeyInConfig(body) {
        // body.value
        await isKeyInConfig(body.value);
    },
    async turnOnOllamaAndGetModelList(body) {
        await turnOnOllamaAndGetModelList();
    },
    async ollamamodellist(body) {
        let ollamaPath = (await which('ollama')).trim();
        if (ollamaPath && !await isKeyInConfig('OLLAMA_MODEL')) {
            try {
                let list = await turnOnOllamaAndGetModelList();
                if (list) {
                    try {
                        if (list.data.models.length) {
                            return list.data.models.map(a => a.name);
                        }
                    } catch (errorInfo) {
                        printError(errorInfo);

                    }
                }
            } catch (errorInfo) {
                printError(errorInfo);

            }
        }
    },
    async setconfig(body) {
        // node index.js -a setconfig '{"key":"OPENAI_MODEL", "value":"gpt-6"}'
        if (!body?.key) return;
        if (!body?.value) return;
        await setVarVal(body?.key, body?.value, true);
    },
    async getconfig(body) {
        // node index.js -a getconfig '{"key":"OPENAI_MODEL"}'
        if (!body?.key) return;
        return await getVarVal(body?.key);
    },
    async resultassigning(body) {
        if (!body?.python_code) return;
        if (!body?.result) return;
        if (!body?.messages_) return;
        if (!body?.history) return;
        return await resultAssigning(body?.python_code, body?.result, body?.messages_, body?.history, true);
    },
    async errorprompthandle(body) {
        return errorPromptHandle(body.request, body.history, body.askforce, body.promptSession);
        // 92,1: export function errorPromptHandle(request, history, askforce, promptSession) {
    },
    async print(body) {
        print(body.key, JSON.stringify(body.data, undefined, 3));
        return body
    },
    async neededpackages(body) {
        // node index.js -a neededpackages '{"python_code":"import numpy"}'
        if (!body?.python_code) return;
        return await neededPackageOfCode(body?.python_code, false);
    },
    async installpackage(body) {
        // node index.js -a installpackage '{"name":"pandas"}'
        let modulesName = body?.name;
        if (!(modulesName)) return;
        const venv_path = await getPythonVenvPath();
        if (!venv_path) return;
        const pathd = `${venv_path}` + '/._module_requirements.py';
        await fsPromises.writeFile(pathd, `${[modulesName].map(name => `import ${name}`).join('\n')}`);
        let importcode = await generateModuleInstallCode(pathd);
        return await shell_exec(importcode.code, false, true, true);
    },
    async shell_exec(body) {
        // node index.js -a shell_exec '{"code":"cHJpbnQoMTIzKQ==", "b64":true}'
        // node index.js -a shell_exec '{"code":"print(123)", "b64":false}'
        let code = body?.code;
        let b64 = body?.b64;
        if (!(code)) return;
        const decodedString = b64 ? Buffer.from(code, 'base64').toString('utf-8') : code;
        return await shell_exec(decodedString, false, true, true);
    },
    async assignnewprompt(body) {
        // if (body?.askforce === undefined) return;
        // if (body?.summary === undefined) return;
        // if (!body?.messages_) return;
        // if (!body?.history) return;
        // if (!body?.prompt) return;
        return await assignNewPrompt(body?.request, body?.history, body?.promptSession, body?.python_code, true);
    },
    async aireq(body) {
        // node index.js -a aireq '{"prompt":"print 123"}'
        // , history = [], messages_ = [], askforce = '', summary
        if (body?.askforce === undefined) return;
        if (body?.summary === undefined) return;
        if (!body?.messages_) return;
        if (!body?.history) return;
        if (!body?.prompt) return;
        setContinousNetworkTryCount(0);
        return await mainApp({ prompt: body.prompt }, true, body.history, body.messages_, body.askforce, body.summary, !!body.first);
    },
    async createVENV(body) {
        // node index.js -a createVENV
        let pythoncheck = [];
        let result;
        try {
            result = await createVENV(true, pythoncheck);
            // console.log('asdfasf', result);
            // return true;
        } catch (e) {
            printError(e);
            // console.log('asdfa1sf', e);
            // return false;
        }
        result = !!result;
        return { result, pythoncheck };
    },
}


if (!isElectron()) {
    (async () => {
        Object.keys(colors).forEach(key => colors[key] = chalk.hex(colors[key]));
        const program = new Command();
        //-----------------------------------------------
        //-----------------------------------------------

        async function showLogo() {
            let latestVersion;
            try {
                const update_check = await getVarVal('UPDATE_CHECK')
                if (!update_check || update_check.toLowerCase() === 'no') throw null;
                let res = await axios.get(`https://raw.githubusercontent.com/kstost/aiexe/main/package.json`);
                latestVersion = (res.data.version);
                if (latestVersion === VERSION) latestVersion = null;
            } catch (e) { printError(e); }
            await figlet.text(
                "AI.EXE",
                {
                    horizontalLayout: "default",
                    verticalLayout: "default",
                    width: 40,
                    whitespaceBreak: true,
                },
                function (err, data) {
                    const content = []
                    content.push(chalk.hex('#dddddd')('A cutting-edge CLI tool'));
                    content.push(chalk.hex('#dddddd')(`for AI integration. Ver. ${VERSION}`));
                    content.push(chalk.hex('#dddddd')(data));
                    content.push(chalk.hex('#dddddd')(`(c) 2024 코드깎는노인's AI Laboratories`) +
                        chalk.hex('#dddddd')(`\n  - Email: monogatree@gmail.com`) +
                        chalk.hex('#dddddd')(`\n  - YouTube: https://www.youtube.com/@codeteller`) +
                        chalk.hex('#dddddd')(`\n  - GitHub: https://github.com/kstost/aiexe`)
                    );
                    if (latestVersion) {
                        content.push('');
                        content.push(chalk.hex('#dddddd')(chalk.yellowBright.bold(`Version ${latestVersion} update is now available.`)));
                        content.push(chalk.hex('#dddddd')('You can update by ' + chalk.yellowBright.bold(isWindows() ? `npm install aiexe -g` : `sudo npm install aiexe -g`)));
                    }
                    print(chalk.bgMagenta(boxen(content.join('\n'), {
                        padding: 1,
                        margin: 0,
                        backgroundColor: 'magenta',
                        borderStyle: 'double',
                        borderColor: '#dddddd',
                        width: 60,
                        titleAlignment: 'center'
                    })));
                }
            );
        }

        program
            .name('aiexe')
            .version(VERSION)
            .description('An advanced CLI tool for automating tasks using AI.')
            .usage('[options] [prompt]')
            .argument('[prompt]', 'Enter the prompt for the task to execute')
            .option('-r, --resetconfig', 'Reset configuration mode')
            .option('-s, --source <source>', 'Source language', 'auto')
            .option('-d, --destination <destination>', 'Destination language', '')
            .option('-c, --choosevendor', 'Choose LLM Vendor')
            .option('-m, --choosemodel', 'Choose LLM Model')
            .option('-b, --debug <scopename>', 'Debug mode', '')
            .option('-a, --api <apimode>', 'API mode', '')
            .option('-p, --python <command>', 'Run a command in the Python virtual environment')
            .action(async (prompt, options) => {

                singleton.options = options;
                if (singleton?.options?.debug === 'ollama_server_test') {
                    let list = await turnOnOllamaAndGetModelList();
                    singleton.debug({ list }, 'ollama_server_test');
                    singleton.debug({ listData: JSON.stringify(list.data) }, 'ollama_server_test');
                    return;
                }
                if (singleton?.options?.debug === 'python_path_test_for_windows') {
                    await (async () => {
                        async function execTest(cmd) {
                            return new Promise(resolve => {
                                shelljs.exec(cmd, { silent: true, }, (code, stdout, stderr) => {
                                    resolve({ code, stdout, stderr });
                                })
                            })
                        }
                        const powershellpath = await getPowerShellPath();
                        const commands = [
                            `Where.exe powershell`,
                            `Where.exe python`,
                            `Where.exe python3`,
                            // `(Get-ChildItem Env:Path).Value`,
                            // `(Get-ChildItem Env:PATH).Value`,
                            `(Get-Command powershell).Source`,
                            `(Get-Command python).Source`,
                            `(Get-Command python3).Source`,
                            `Get-Command powershell`,
                            `Get-Command python`,
                            `Get-Command python3`,
                            `python --version`,
                            `python3 --version`,
                        ];
                        let commandList = [
                            ...commands,
                            ...commands.map(line => {
                                if (!powershellpath) return;
                                if (powershellpath.indexOf(' ') > -1) return;
                                return `${powershellpath} -Command "${line}"`
                            }).filter(Boolean),
                        ];
                        let resultList = [{ powershellpath }];
                        for (let i = 0; i < commandList.length; i++) {
                            let result = await execTest(commandList[i]);
                            result.command = commandList[i];
                            resultList.push(result);
                        }
                        console.log('-'.repeat(80));
                        console.log(`확인해봐주셔서 감사합니다.`);
                        console.log(`각 AIEXE 이용을 위해 필요한 컴퓨터 환경에 설치된 python, powershell등의 위치가 올바르게 인식되는지에 대한 확인을위한 명령어와 그에 따른 수행결과입니다.`);
                        console.log(commandList.join('\n'));
                        console.log(`여기에서부터`);
                        console.log(JSON.stringify(resultList))
                        console.log(`여기까지의 내용을`);
                        console.log(`코드깎는노인의 이메일 monogatree@gmail.com로 보내주시거나 댓글로 첨부 부탁드립니다. 감사합니다.`);
                        console.log('-'.repeat(80));
                    })();
                    process.exit(0);
                    return;
                }
                const bash_path = !isWindows() ? await which(`bash`) : null;
                if (!isWindows() && !bash_path) {
                    console.error('This app requires bash to function.')
                    process.exit(1)
                }
                if (options.python) {
                    try {
                        await checkPythonForTermination();
                        const clone = options.python.split(' ');
                        const commd = clone[0];
                        clone.shift();
                        await execInVenv(clone.join(' '), commd);
                    } catch (errorInfo) { printError(errorInfo); }
                    return;
                }
                if (options.destination) {
                    try {
                        await installProcess();
                        if (!Object.keys(langtable).includes(options.destination.toLowerCase())) {
                            console.log(`Unsupported destination language: ${options.destination}`);
                            return;
                        }

                        Object.keys(promptTemplate).forEach(langCode => {
                            promptTemplate[langCode].forEach(prompt => prompt['content'] = prompt['content'].split('\n').map(line => line.trim()).join('\n').trim())
                        });
                        const mainlg = async (input) => {
                            if (!input) return;
                            const USE_LLM = await getVarVal('USE_LLM');
                            async function languageDetector(input) {
                                let counter = 3;
                                while (counter > 0) {
                                    try {
                                        let iso = await aiChat([{
                                            role: 'system', content: [
                                                `You determine the language in which the user speaks and respond with the appropriate language code in ISO 639-1 format.`,
                                                `## ISO 639-1 Table`,
                                                `{`,
                                                `    "en": "English",`,
                                                `    "fr": "Français",`,
                                                `    "ko": "한국어",`,
                                                `    "ja": "日本語",`,
                                                `    "vi": "Tiếng Việt",`,
                                                `    "es": "Español",`,
                                                `    "de": "Deutsch",`,
                                                `    "zh": "中文",`,
                                                `    "ru": "Русский",`,
                                                `    "it": "Italiano",`,
                                                `    "pt": "Português",`,
                                                `    "hi": "हिन्दी"`,
                                                `}`,
                                                ``,
                                                `## INSTRUCT`,
                                                `- response only 2 bytes for the ISO 639-1 language code`,
                                            ].join('\n').trim()
                                        }, { role: 'user', content: 'I am happy' }, { role: 'assistant', content: 'en' }, { role: 'user', content: '나는 행복하다' }, { role: 'assistant', content: 'ko' }, { role: 'user', content: '教えて' }, { role: 'assistant', content: 'ja' }, { role: 'user', content: 'cám ơn' }, { role: 'assistant', content: 'vi' }, { role: 'user', content: 'bien-être' }, { role: 'assistant', content: 'fr' }, { role: 'user', content: input.substring(0, 50) },]);
                                        iso = iso.split('"').join('');
                                        iso = iso.toLowerCase();
                                        if (iso?.length !== 2) throw null;
                                        return iso;
                                    } catch (errorInfo) {
                                        printError(errorInfo);
                                        counter--;
                                    }
                                }
                            }
                            let source = options.source;
                            if (await isModelLlamas()) {
                                source = source !== "auto" ? source : await languageDetector(input);
                                if (source?.length !== 2) return;
                            } else {
                                source = source !== "auto" ? source : "";
                                if (!(source?.length === 2 || source?.length === 0)) return;
                            }
                            let counter = 3;
                            while (counter > 0) {
                                try {
                                    let oiajfd = source ? langtable[source] : forignLanguage[options.destination];
                                    if (!oiajfd) oiajfd = 'forign language';
                                    const sourceCode = oiajfd;
                                    if (sourceCode && promptTemplate[options.destination]) {
                                        const eres = JSON.stringify(promptTemplate[options.destination]);
                                        const parsed = JSON.parse(eres.split('#LANGCODE#').join(sourceCode));
                                        const messages = [];
                                        messages.push(parsed[0]);
                                        !(await isModelLlamas()) ? null : [greetings, whatAreYouDoing, howAreYou].forEach(obj => {
                                            messages.push({ role: 'user', content: obj[source] });
                                            messages.push({ role: 'assistant', content: obj[options.destination] });
                                        })
                                        messages.push(parsed.at(-1))
                                        messages[messages.length - 1].content = messages[messages.length - 1].content.split('\n').map(a => a.trim()).join('\n');
                                        messages[messages.length - 1].content = messages[messages.length - 1].content.split('#TRANSDATA#').join('\n```\n' + input + '\n```\n')
                                        let result = await aiChat(messages);
                                        let sentence = result;
                                        if (sentence) sentence = sentence.trim();
                                        if (!sentence) throw null;
                                        print(sentence);
                                    }
                                    break;
                                } catch (e) {
                                    printError(e);
                                    counter--;
                                }
                            }
                        }
                        if (!prompt) {
                            let input = '';
                            process.stdin.on('data', (chunk) => input += chunk);
                            process.stdin.on('end', () => mainlg(input));
                        } else {
                            await mainlg(prompt);
                        }
                    } catch (errorInfo) { printError(errorInfo); }
                    return;
                }

                if (!options?.api) await showLogo();
                if (options.resetconfig) {
                    await disableAllVariable();

                    try { await installProcess(); } catch (errorInfo) { printError(errorInfo); }
                } else if (options.choosevendor) {
                    await disableVariable('USE_LLM');

                    try { await installProcess(); } catch (errorInfo) { printError(errorInfo); }
                } else if (options.choosemodel) {
                    const vendor = await getVarVal('USE_LLM')
                    if (vendor === 'gemini') await disableVariable('USE_LLM');
                    if (vendor === 'ollama') await disableVariable('OLLAMA_MODEL');
                    if (vendor === 'openai') await disableVariable('OPENAI_MODEL');
                    if (vendor === 'groq') await disableVariable('GROQ_MODEL');
                    if (vendor === 'anthropic') await disableVariable('ANTHROPIC_MODEL');

                    try { await installProcess(); } catch (errorInfo) { printError(errorInfo); }
                }
                if (!(options?.api)) {
                    try {
                        await installProcess();
                        print('')
                        const request = prompt ? prompt : await ask_prompt_text(`What can I do for you?.`);
                        await mainApp({ prompt: request });
                    } catch (errorInfo) { printError(errorInfo); }
                } else {
                    let body = null;
                    try { body = !prompt ? null : JSON.parse(prompt); } catch (e) { printError(e); }
                    const apiName = options?.api;
                    const resp = { apiName };
                    if (apiMethods[apiName]) {
                        let response = await apiMethods[apiName](body);
                        resp.response = response;
                    }
                    print(JSON.stringify(resp, undefined, 3));
                }
            });
        program.parse(process.argv);
    })();
} else {
    // electron
}
//