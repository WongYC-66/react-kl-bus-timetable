import { writeToDisk } from "./processRawJSON.js";

export class GTFSJsonProcessor {
    constructor(paths) {
        const { routesPath, tripsPath, stopTimesPath, stopsPath } = paths
        this.routesPath = routesPath
        this.tripsPath = tripsPath
        this.stopTimesPath = stopTimesPath
        this.stopsPath = stopsPath
    }

    loadAllJson = async () => {
        const { default: allRoutes } = await import(this.routesPath, { with: { type: 'json' } })
        const { default: allTrips } = await import(this.tripsPath, { with: { type: 'json' } })
        const { default: allStopTimes } = await import(this.stopTimesPath, { with: { type: 'json' } })
        const { default: allStops } = await import(this.stopsPath, { with: { type: 'json' } })

        this.allRoutes = allRoutes
        this.allTrips = allTrips
        this.allStopTimes = allStopTimes
        this.allStops = allStops
    }

    getRouteData = async () => {
        throw new Error("Shouldn't invoke this method!")
    }

    _fillRouteDataWithTrips = (routeIdToHash) => {
        this.allTrips.forEach(({ route_id, trip_id, trip_headsign }) => {
            if (!routeIdToHash[route_id]) throw Error("route id not found")
            routeIdToHash[route_id] ??= {}
            routeIdToHash[route_id].trips ??= {}
            routeIdToHash[route_id].trips[trip_id] = trip_headsign
        })
    }

    getTripData = async () => {
        const tripIdToHash = {}
        this.allStopTimes.forEach(({ trip_id, arrival_time, stop_id, stop_sequence }) => {
            tripIdToHash[trip_id] ??= {}
            tripIdToHash[trip_id][stop_sequence] = { arrival_time, stop_id }
        })
        return tripIdToHash
    }

    getStopData = async () => {
        throw new Error("Shouldn't invoke this method!")
    }

    generateRouteData = async () => {
        const data = await this.getRouteData()
        await writeToDisk({ filename: 'my-routes.json', data })
    }

    generateTripData = async () => {
        const data = await this.getTripData()
        await writeToDisk({ filename: 'my-trips.json', data })
    }

    generateStopData = async () => {
        const data = await this.getStopData()
        await writeToDisk({ filename: 'my-stops.json', data })
    }

    static loadProcessedJson = async () => {
        const { default: myAllRoutes } = await import("../data/my-routes.json", { with: { type: 'json' } })
        const { default: myAllTrips } = await import("../data/my-trips.json", { with: { type: 'json' } })
        const { default: myAllStops } = await import("../data/my-stops.json", { with: { type: 'json' } })
        return { myAllRoutes, myAllTrips, myAllStops }
    }

    static generateRouteWithKeywords = async () => {
        // derive data from my-routes.json/my-stops.json/my-trips.json
        // to be used as keyword search reference
        let routeIdToKeywords = {}
        await this._addKeywordsFromRouteTripAndStop(routeIdToKeywords)
        this._removeDuplicateKeywords(routeIdToKeywords)
        await writeToDisk({ filename: 'my-routes-keywords.json', data: routeIdToKeywords })
    }

    static _addKeywordsFromRouteTripAndStop = async (routeIdToKeywords) => {
        const { myAllRoutes, myAllTrips, myAllStops } = await this.loadProcessedJson()
        for (let routeId in myAllRoutes) {
            const info = myAllRoutes[routeId]
            const { route_long_name, route_short_name, trips } = info

            const keywords = []
            if (route_long_name) keywords.push(route_long_name) // add route_long_name
            if (route_short_name) keywords.push(route_long_name) // add route_long_name

            for (let tripId in trips) {
                const tripName = trips[tripId]
                if (tripName) keywords.push(tripName)         // add tripname

                const trip = myAllTrips[tripId]
                for (let stopSeq in trip) {
                    const stopId = trip[stopSeq].stop_id
                    const stopInfo = myAllStops[stopId]

                    const { stop_code, stop_name, stop_desc } = stopInfo
                    if (stop_code) keywords.push(stop_code)  // add stop_code
                    if (stop_name) keywords.push(stop_name)  // add stop_code
                    if (stop_desc) keywords.push(stop_desc)  // add stop_desc
                }
            }
            routeIdToKeywords[routeId] = keywords
        }
    }

    static _removeDuplicateKeywords = (hashTable) => {
        for (let key in hashTable) {
            const strArr = hashTable[key]
            hashTable[key] = [...new Set(strArr)]   // to unique
        }
    }
}

export class MrtFeederBusJsonProcessor extends GTFSJsonProcessor {
    getRouteData = async () => {
        const routeIdToHash = {}
        this.allRoutes.forEach(({ route_id, route_long_name }) => {
            routeIdToHash[route_id] ??= {}
            routeIdToHash[route_id].route_long_name = route_long_name
            routeIdToHash[route_id].provider = "MRT_Feeder"
        })
        this._fillRouteDataWithTrips(routeIdToHash)
        return routeIdToHash
    }

    getStopData = async () => {
        const stopIdToHash = {}
        this.allStops.forEach(({ stop_id, stop_code, stop_name, ...rest }) => {
            stopIdToHash[stop_id] = { stop_code, stop_name }
        })
        return stopIdToHash
    }
}

export class RapidKLBusJsonProcessor extends GTFSJsonProcessor {
    getRouteData = async () => {
        const routeIdToHash = {}
        this.allRoutes.forEach(({ route_id, route_long_name, route_short_name }) => {
            routeIdToHash[route_id] ??= {}
            routeIdToHash[route_id].route_long_name = route_long_name
            routeIdToHash[route_id].route_short_name = route_short_name
            routeIdToHash[route_id].provider = "RapidKL"
        })
        this._fillRouteDataWithTrips(routeIdToHash)
        return routeIdToHash
    }

    getStopData = async () => {
        const stopIdToHash = {}
        this.allStops.forEach(({ stop_id, stop_desc, stop_name, ...rest }) => {
            stopIdToHash[stop_id] = { stop_desc, stop_name }
        })
        return stopIdToHash
    }
}