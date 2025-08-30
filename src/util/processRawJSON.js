import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url'

import { GTFSJsonProcessor, MrtFeederBusJsonProcessor, RapidKLBusJsonProcessor } from './GTFSJsonProcessor.js';

export const writeToDisk = async ({ filename, outputFolder, data }) => {
    const stringified = JSON.stringify(data, null, 2)
    // const stringified = JSON.stringify(data)
    const path = outputFolder
        ? `${outputFolder}/${filename}`
        : `./src/data/${filename}`
    await writeFile(path, stringified, { encoding: "utf8" })
    console.log(`Writed to ${path}`)
}

const _mergeHash = async (p1, p2) => {
    const combinedHash = { ...(await p1), ...(await p2) }
    return combinedHash
}

const main = async () => {
    try {
        const MRTFeederPaths = {
            routesPath: "../../public/data/rapid-bus-mrtfeeder/routes.json",
            tripsPath: "../../public/data/rapid-bus-mrtfeeder/trips.json",
            stopTimesPath: "../../public/data/rapid-bus-mrtfeeder/stop_times.json",
            stopsPath: "../../public/data/rapid-bus-mrtfeeder/stops.json",
        }

        const RapidKLBusPaths = {
            routesPath: "../../public/data/rapid-bus-kl/routes.json",
            tripsPath: "../../public/data/rapid-bus-kl/trips.json",
            stopTimesPath: "../../public/data/rapid-bus-kl/stop_times.json",
            stopsPath: "../../public/data/rapid-bus-kl/stops.json",
        }

        const mrtJsonProcessor = new MrtFeederBusJsonProcessor(MRTFeederPaths)
        const rapidKLjsonProcessor = new RapidKLBusJsonProcessor(RapidKLBusPaths)

        await mrtJsonProcessor.loadAllJson()
        await rapidKLjsonProcessor.loadAllJson()

        // generate my-routes.json / my-stops.json / my-trips.json
        const combinedRouteData = await _mergeHash(mrtJsonProcessor.getRouteData(), rapidKLjsonProcessor.getRouteData())
        const combinedTripData = await _mergeHash(mrtJsonProcessor.getTripData(), rapidKLjsonProcessor.getTripData())
        const combinedStopData = await _mergeHash(mrtJsonProcessor.getStopData(), rapidKLjsonProcessor.getStopData())
        await writeToDisk({ filename: 'my-routes.json', data: combinedRouteData })
        await writeToDisk({ filename: 'my-trips.json', data: combinedTripData })
        await writeToDisk({ filename: 'my-stops.json', data: combinedStopData })

        // generate my-routes-keywords.json
        await GTFSJsonProcessor.generateRouteWithKeywords()

    } catch (e) {
        console.error("FAILED!")
        console.error(e)
    }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    main()
}