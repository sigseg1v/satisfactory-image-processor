import { readFile, writeFile } from 'node:fs/promises';
import { exit } from 'node:process';
import pako from 'pako';
import { createCanvas, loadImage } from 'canvas';

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('\tUsage: node satisimg.mjs <path-to-file> [--decode-input] [--out-path=output.cbp]');
    console.error('\tOutput: produces a .cbp file from an image, rendering non-transparent pixels as 1x1 beams in the game Satisfactory. A cbp file is a "megablueprint" which can be loaded in satisfactory-calculator. Output file name can be changed via setting --out-path=...');
    console.error('\t<path-to-file>: should be a path to an image file to load. If using --decode-input, then should be a .cbp file from satisfactory-calculator.');
    console.error('\t[--decode-input]: instructs the tool to output a file called "input.json" containing the decoded json from the input file. This can be used to debug a cbp file to see the contents. Output file name can be changed via setting --out-path=...');
    exit(1);
}

const filePath = args[0];
const opt = args[1];
const outputFileName = args.filter(a => a.startsWith('--out-path=')).map(a => a.replace(/^\-\-out\-path\=/, ''))[0];

if (opt === '--decode-input') {
    const content = JSON.parse(Buffer.from(pako.inflate(await readFile(filePath))).toString());
    const finalName = outputFileName || 'input.json';
    await writeFile(finalName, JSON.stringify(content, null, 4));
    console.log(`wrote decoded data to ${finalName}`);
    exit(0);
}

let currentObjectId = 2144098632;
const gameObjectSize = 100;

const imgData = await readFile(filePath);
if (!imgData || imgData.length === 0) {
    console.error(`Could not load image at ${filePath}`);
    exit(1);
}

const img = await loadImage(imgData);
const canvas = createCanvas(img.width, img.height);
const canvasContext = canvas.getContext('2d');
canvasContext.drawImage(img, 0, 0, img.width, img.height);

const output = {
    "saveVersion": 46,
    "buildVersion": 368883,
    "data": [],
    "pipes": {},
    "powerCircuits": {},
    "hiddenConnections": {},
    "minX": 0,
    "maxX": img.width * gameObjectSize,
    "minY": 0,
    "maxY": img.height * gameObjectSize
};

for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
        const block = processPixelToObject(x, y, canvasContext); // item to draw or null if transparent
        if (block !== null) {
            output.data.push(block);
        }
    }
}

const finalFileName = outputFileName || 'output.cbp';

await writeFile(finalFileName, pako.deflate(JSON.stringify(output)));

console.log(`output Satisfactory block image of size ${img.width}x${img.height} with block count of ${output.data.length} to ${finalFileName}`);
exit(0);

// =====

function translatePixelToGameTranslation(x, y) {
    // draw upright on the y and z axis
    return [0, x * gameObjectSize, y * gameObjectSize];
}

function translatePixelToGameColor(x, y, colorData) {
    return {
        "type": "LinearColor",
        "values": {
            "r": colorData[0] / 255.0,
            "g": colorData[1] / 255.0,
            "b": colorData[2] / 255.0,
            "a": colorData[3] / 255.0
        }
    };
}

function processPixelToObject(x, y, canvasContext) {
    const colorData = canvasContext.getImageData(x, y, 1, 1).data || [0, 0, 0, 0];
    const alpha = colorData[3];
    if (alpha === 0) {
        // transparent; don't draw this pixel
        return null;
    }

    const id = currentObjectId--;

    return {
        "parent": {
            "className": "/Game/FactoryGame/Prototype/Buildable/Beams/Build_Beam_Painted.Build_Beam_Painted_C",
            "pathName": `Persistent_Level:PersistentLevel.Build_Beam_Painted_C_${id}`,
            "needTransform": 1,
            "transform": {
                "rotation": [0, 0, 0, 1],
                "translation": translatePixelToGameTranslation(x, y)
            },
            "entity": {
                "pathName": "Persistent_Level:PersistentLevel.BuildableSubsystem"
            },
            "properties": [
                {
                    "name": "mLength",
                    "type": "Float",
                    "value": gameObjectSize
                },
                {
                    "name": "mColorSlot",
                    "type": "Byte",
                    "value": {
                        "enumName": "None",
                        "value": 255
                    }
                },
                {
                    "name": "mCustomizationData",
                    "type": "Struct",
                    "value": {
                        "type": "FactoryCustomizationData",
                        "values": [
                            {
                                "name": "SwatchDesc",
                                "type": "Object",
                                "value": {
                                    "levelName": "",
                                    "pathName": "/Game/FactoryGame/Buildable/-Shared/Customization/Swatches/SwatchDesc_Custom.SwatchDesc_Custom_C"
                                }
                            },
                            {
                                "name": "OverrideColorData",
                                "type": "Struct",
                                "value": {
                                    "type": "FactoryCustomizationColorSlot",
                                    "values": [
                                        {
                                            "name": "PrimaryColor",
                                            "type": "Struct",
                                            "value": translatePixelToGameColor(x, y, colorData)
                                        },
                                        {
                                            "name": "SecondaryColor",
                                            "type": "Struct",
                                            "value": translatePixelToGameColor(x, y, colorData)
                                        },
                                        {
                                            "name": "PaintFinish",
                                            "type": "Object",
                                            "value": {
                                                "levelName": "",
                                                "pathName": "/Game/FactoryGame/Buildable/-Shared/Customization/PaintFinishes/PaintFinishDesc_Matte.PaintFinishDesc_Matte_C"
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        },
        "children": []
    };
}