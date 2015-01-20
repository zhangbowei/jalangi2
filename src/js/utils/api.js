/*
 * Copyright 2014 Samsung Information Systems America, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * API for invoking Jalangi programatically from node.js code
 */

// places required functions on J$
require('./../Constants.js');
require('./../Config.js');
require('./../instrument/astUtil.js');
require('./../instrument/esnstrument.js');
// TODO making globals here is kind of gross
acorn = require('acorn');
esotope = require('esotope');
var temp = require('temp');

function getInstOutputFile(filePath) {
    if (filePath) {
        return path.resolve(filePath);
    } else {
        return temp.path({suffix: '.js'});
    }
}

/**
 * setup the global Config object based on the given instrumentation handler object
 * @param instHandler
 */
function setupConfig(instHandler) {
    var conf = J$.Config;
    conf.INSTR_READ = instHandler.instrRead;
    conf.INSTR_WRITE = instHandler.instrWrite;
    conf.INSTR_GETFIELD = instHandler.instrGetfield;
    conf.INSTR_PUTFIELD = instHandler.instrPutfield;
    conf.INSTR_BINARY = instHandler.instrBinary;
    conf.INSTR_PROPERTY_BINARY_ASSIGNMENT = instHandler.instrPropBinaryAssignment;
    conf.INSTR_UNARY = instHandler.instrUnary;
    conf.INSTR_LITERAL = instHandler.instrLiteral;
    conf.INSTR_CONDITIONAL = instHandler.instrConditional;
}

/**
 * clear any configured instrumentation control functions from the global Config object
 */
function clearConfig() {
    var conf = J$.Config;
    conf.INSTR_READ = null;
    conf.INSTR_WRITE = null;
    conf.INSTR_GETFIELD = null;
    conf.INSTR_PUTFIELD = null;
    conf.INSTR_BINARY = null;
    conf.INSTR_PROPERTY_BINARY_ASSIGNMENT = null;
    conf.INSTR_UNARY = null;
    conf.INSTR_LITERAL = null;
    conf.INSTR_CONDITIONAL = null;
}

/**
 * instruments a code string, returning an object with the following fields:
 * - code: the instrumented code string
 * - instAST: AST for the instrumented code
 * - sourceMapObject: mapping from IIDs to source info
 *
 * The options parameter can contain the following parameters:
 *
 * - inputFileName: this name will be associated
 * with the original code in the source map.
 * - outputFile: file name for instrumented code.  note that this
 * method does *not* write the file; this information is just for
 * the source map
 * - instHandler: An instrumentation handler object, for controlling which
 * constructs get instrumented.  Possible properties are instrRead, instrWrite, instrGetfield,
 * instrPutfield, instrBinary, instrPropBinaryAssignment, instrUnary, instrLiteral, and instrConditional,
 * corresponding to the similarly-named properties documented in Config.js.
 *
 * @param code
 */
function instrumentString(code, options) {
    if (!options) {
        options = {};
    }
    var outputFileName = getInstOutputFile(options.outputFile);
    // TODO invoke J$.instrumentCode appropriately
    //      * @param {{isEval: boolean, code: string, thisIid: int, origCodeFileName: string, instCodeFileName: string, inlineSourceMap: boolean, inlineSource: boolean, url: string }} options

    var instCodeOptions = {
        code: code,
        origCodeFileName: options.inputFileName,
        instCodeFileName: outputFileName

    };
    if (options.instHandler) {
        setupConfig(options.instHandler);
    }
    var result = J$.instrumentCode(instCodeOptions);
    clearConfig();
    return result;
}

exports.instrumentString = instrumentString;