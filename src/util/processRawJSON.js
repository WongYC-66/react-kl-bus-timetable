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
    } catch (e) {
        console.error("FAILED!")
        console.error(e)
    }
}


main()