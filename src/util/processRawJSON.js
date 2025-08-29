import { writeFile } from 'node:fs/promises';

import allRoutes from "../../public/data/routes.json" with { type: "json" };
import allTrips from "../../public/data/trips.json" with { type: "json" };
import allStopTimes from "../../public/data/stop_times.json" with { type: "json" };
import allStops from "../../public/data/stops.json" with { type: "json" };

const generateRouteData = async () => {
    const routeIdToHash = {}
    allRoutes.forEach(({ route_id, route_long_name }) => {
        routeIdToHash[route_id] ??= {}
        routeIdToHash[route_id].route_long_name = route_long_name
    })
    allTrips.forEach(({ route_id, trip_id, trip_headsign }) => {
        if (!routeIdToHash[route_id]) throw Error("route id not found")
        routeIdToHash[route_id] ??= {}
        routeIdToHash[route_id].trips ??= {}
        routeIdToHash[route_id].trips[trip_id] = trip_headsign
    })

    await writeToDisk('my-routes.json', routeIdToHash)
}

const generateTripData = async () => {
    const tripIdToHash = {}
    allStopTimes.forEach(({ trip_id, arrival_time, stop_id, stop_sequence }) => {
        tripIdToHash[trip_id] ??= {}
        tripIdToHash[trip_id][stop_sequence] = { arrival_time, stop_id }
    })
    await writeToDisk('my-trips.json', tripIdToHash)
}

const generateStopData = async () => {
    const stopIdToHash = {}
    allStops.forEach(({ stop_id, stop_code, stop_name, ...rest }) => {
        stopIdToHash[stop_id] = { stop_code, stop_name }
    })
    await writeToDisk('my-stops.json', stopIdToHash)
}

const generateRouteWithKeywords = async () => {
    // derive data from my-routes.json/my-stops.json/my-trips.json
    // to be used as keyword search reference
    const { default: myAllRoutes } = await import("../data/my-routes.json", { with: { type: 'json' } })
    const { default: myAllTrips } = await import("../data/my-trips.json", { with: { type: 'json' } })
    const { default: myAllStops } = await import("../data/my-stops.json", { with: { type: 'json' } })

    const routeIdToKeywords = {}
    for (let routeId in myAllRoutes) {
        const info = myAllRoutes[routeId]
        const { route_long_name, trips } = info
        const keywords = [route_long_name]

        for (let tripId in trips) {
            const trip = myAllTrips[tripId]
            for (let stopSeq in trip) {
                const stopId = trip[stopSeq].stop_id
                const stopName = myAllStops[stopId].stop_name
                const stopCode = myAllStops[stopId].stop_code
                keywords.push(stopName, stopCode)
            }
        }
        routeIdToKeywords[routeId] = keywords
    }

    for (let routeId in routeIdToKeywords) {
        const strArr = routeIdToKeywords[routeId]
        routeIdToKeywords[routeId] = [...new Set(strArr)]   // to unique
    }
    await writeToDisk('my-routes-keywords.json', routeIdToKeywords)
}


const writeToDisk = async (filename, data) => {
    const stringified = JSON.stringify(data, null, 2)
    // const stringified = JSON.stringify(data)
    const path = `./src/data/${filename}`
    await writeFile(path, stringified, { encoding: "utf8" })
    console.log(`Writed to ${path}`)
}


const main = async () => {
    try {
        await generateRouteData()
        await generateTripData()
        await generateStopData()
        await generateRouteWithKeywords()
    } catch (e) {
        console.error("FAILED!")
        console.error(e)
    }
}


main()