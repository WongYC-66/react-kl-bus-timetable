import allRoutes from "../data/my-routes.json"
import allTrips from "../data/my-trips.json"
import allStops from "../data/my-stops.json"
import allRouteWithKeywords from "../data/my-routes-keywords.json"
import GtfsRealtimeBindings from "gtfs-realtime-bindings"

export const getRelevantRoutes = (searchTerm) => {
    searchTerm = searchTerm.toLowerCase()

    const result = []

    Object.entries(allRouteWithKeywords)
        .forEach(([routeId, keywords]) => {
            if (keywords.some(key => key.toLowerCase().includes(searchTerm))) {
                result.push(routeId)
            }
        })

    return result
}

export const getRouteNameById = (routeId) => {
    const routeInfo = allRoutes[routeId]
    if (!routeInfo) return null

    switch (routeInfo.provider) {
        case 'MRT_Feeder':
            return routeInfo.route_long_name
        case 'RapidKL':
        default:
            return routeInfo.route_short_name
    }
}

export const getRouteWithNames = (routes) => {
    return routes
        .map(routeId => ({
            routeId,
            name: getRouteNameById(routeId)
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
}

export const getTripNamesByRouteId = (selectedRoute) => {
    const uniqueNames = new Set()
    const routeInfo = allRoutes[selectedRoute]

    if (routeInfo.provider === "MRT_Feeder") {
        const trips = routeInfo.trips
        for (let tripId in trips) {
            uniqueNames.add(trips[tripId])
        }
    } else if (routeInfo.provider === 'RapidKL') {
        uniqueNames.add(routeInfo.route_long_name)
    }
    return [...uniqueNames]
}

export const getStopAndTimeByRouteId = (selectedRoute) => {
    // 1 :{
    //     arrival_times   :['21:00:00', '22:30:00', '06:00:00', '07:40:00', '09:20:00', '11:30:00', '13:40:00', '15:30:00', '17:40:00', '19:30:00', '06:20:00', '08:00:00', '09:40:00', '12:00:00', '14:00:00', '16:00:00', '18:00:00', '21:45:00', '23:30:00', '06:40:00', '08:20:00', '10:00:00', '12:30:00', '14:30:00', '16:30:00', '18:20:00', '20:00:00', '07:00:00', '08:40:00', '10:30:00', '17:00:00', '18:40:00', '20:30:00', '07:20:00', '09:00:00', '11:00:00', '13:00:00', '15:00:00', '17:20:00', '19:00:00', '22:10:00', '23:30:00', '06:00:00', '08:00:00', '10:00:00', '12:40:00', '15:00:00', '17:00:00', '19:00:00', '21:00:00', '06:30:00', '08:30:00', '10:40:00', '13:20:00', '15:30:00', '17:30:00', '07:00:00', '09:00:00', '11:20:00', '14:00:00', '16:00:00', '18:00:00', '19:40:00', '07:30:00', '09:30:00', '12:00:00', '14:30:00', '16:30:00', '18:30:00', '20:20:00']
    //     stop_id : 12002057
    //     stop_code : "KL451"
    //     stop_name :"MRT METRO PRIMA PINTU A"
    // }
    const res = {}

    const trips = allRoutes[selectedRoute].trips
    const tripIds = Object.keys(trips)

    tripIds.forEach(tripId => {
        const stop_sequences = allTrips[tripId]

        for (let stop_sequence in stop_sequences) {
            const { arrival_time, stop_id } = stop_sequences[stop_sequence]
            const { stop_name, stop_code } = allStops[stop_id]

            res[stop_sequence] ??= {}
            res[stop_sequence].stop_name ??= stop_name
            res[stop_sequence].stop_id ??= stop_id
            res[stop_sequence].stop_code ??= stop_code
            res[stop_sequence].arrival_times ??= []
            res[stop_sequence].arrival_times.push(arrival_time)
        }
    })
    // console.log(res)

    return res
}

export const getRouteProvider = (routeId) => {
    return allRoutes?.[routeId]?.provider
}

export const addGeoInfo = (stopInfoHash) => {
    const res = {}
    for (let stopSeq in stopInfoHash) {
        const stopInfo = stopInfoHash[stopSeq]
        const stop_id = stopInfo.stop_id
        res[stopSeq] = {
            ...stopInfo,
            lat: allStops[stop_id].stop_lat,
            lon: allStops[stop_id].stop_lon,
        }
    }
    return res
}

export const toArrayOfStopObj = (stopInfoHash) => {
    return Object.entries(stopInfoHash)
        .map(([stopSeq, stopInfo]) => ({ stopSeq, ...stopInfo }))
        .map(convertGeoToNumberType)
}

const convertGeoToNumberType = (obj) => {
    const { lat, lon, ...rest } = obj
    return {
        ...rest,
        lat: Number(lat),
        lon: Number(lon)
    }
}

export const getCenterLocation = (positions) => {
    let latitudeSum = 0
    let longitudeSum = 0

    positions.forEach(([lat, lon]) => {
        latitudeSum += lat
        longitudeSum += lon
    })

    const avgLatitude = latitudeSum / positions.length
    const avgLongitude = longitudeSum / positions.length

    return [avgLatitude, avgLongitude]
}

export const getGTFSLiveData = async (selectedRoute) => {

    // Get Live Bus data , 
    // https://gtfs.org/documentation/realtime/language-bindings/nodejs/
    // https://github.com/TransitApp/gtfs-realtime-bindings/blob/master/nodejs/README.md

    const URLs = [
        `https://api.data.gov.my/gtfs-realtime/vehicle-position/prasarana?category=rapid-bus-mrtfeeder`,
        `https://api.data.gov.my/gtfs-realtime/vehicle-position/prasarana?category=rapid-bus-kl`,
    ]

    const tasks = URLs.map(async (url) => {
        const response = await fetch(url)
        const buffer = await response.arrayBuffer();

        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(buffer)
        );

        return feed
    })

    const feedArr = await Promise.all(tasks)

    const busData = feedArr
        .map(feed => feed.entity)
        .flat()
        .map(feedEntity => feedEntity.vehicle)  // ignore id

    // console.log({ feedArr })
    return busData
}

export const filterRelevantBus = (bus, routeId) => {
    const serviceProvider = getRouteProvider(routeId)

    let targetRouteName = ""
    switch (serviceProvider) {
        case 'RapidKL':
            targetRouteName = routeId
            // targetRouteName = getRapidKLRouteShortName(routeId)
            break
        case 'MRT_Feeder':
        default:
            targetRouteName = getMRTRouteLongName(routeId)
            break
    }

    return bus.filter(vehicle => vehicle?.trip?.routeId === targetRouteName)
}

export const getMRTRouteLongName = (routeId) => {
    return allRoutes?.[routeId]?.route_long_name
}

export const getRapidKLRouteShortName = (routeId) => {
    return allRoutes?.[routeId]?.route_short_name
}
