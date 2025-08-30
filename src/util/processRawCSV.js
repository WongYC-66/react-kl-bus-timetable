// https://www.npmjs.com/package/csvtojson

import { readdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url'
import path from 'node:path';

import csv from "csvtojson"

import { writeToDisk } from "./processRawJSON.js"


const convertFolder = async (folderPath) => {

    // for every csv in the folder, convert to json
    const files = await readdir(folderPath)
    for (let fileName of files) {
        if (fileName.endsWith('.csv')) {
            const filepath = path.resolve(folderPath, fileName)
            const jsonArray = await csv().fromFile(filepath);
            const saveFileName = fileName.replace(/.csv$/, '.json')
            await writeToDisk({ filename: saveFileName, outputFolder: folderPath, data: jsonArray })
        }
    }
    // const csvFilePath = './public/data/rapid-bus-kl/agency.csv'
    console.log(`Converted to json : ${folderPath}`)
}

const main = async () => {
    try {
        await convertFolder("./public/data/rapid-bus-kl")
        await convertFolder("./public/data/rapid-bus-mrtfeeder")
    } catch (e) {
        console.error("FAILED!")
        console.error(e)
    }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main()
}