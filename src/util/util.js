import allRoutes from "../data/my-routes.json"
import allTrips from "../data/my-trips.json"
import allStops from "../data/my-stops.json"

export const getRelevantRoutes = (searchTerm) => {
    searchTerm = searchTerm.toLowerCase()

    const result = _getRelevantRoutes()     // [[routeId, [str1, str2, ...]]]

    return result
        .filter(([_, areaToSearch]) => areaToSearch.some(text => text.toLowerCase().includes(searchTerm)))
        .map(([routeId]) => routeId)
}

const _getRelevantRoutes = () => {
    const result = []

    for (let routeId in allRoutes) {
        let areaToSearch = new Set()

        const routeDetail = allRoutes[routeId]

        areaToSearch.add(routeDetail.route_long_name)   // e.g. T808

        for (let tripId in routeDetail.trips) {
            areaToSearch.add(routeDetail.trips[tripId]) // e.g. MRT SURIAN - SEK 11 KOTA DAMANSARA
        }

        result.push([routeId, [...areaToSearch]])
    }
    return result
}

export const getRouteNameById = (routeId) => {
    return allRoutes?.[routeId]?.route_long_name
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
    const trips = allRoutes[selectedRoute].trips
    for (let tripId in trips) {
        uniqueNames.add(trips[tripId])
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
