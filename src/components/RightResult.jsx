import { useEffect, useMemo, useState } from "react"

import { filterRelevantBus, getGTFSLiveData, getRouteNameById, getRouteProvider, getStopAndTimeByRouteId, getTripNamesByRouteId } from "../util/util"
import Stop from "./Stop"
import RouteMap from "./RouteMap"

const FETCH_TIME_INTERVAL = 15000 // 15 sec

export default function RightResult(props) {
  const { selectedRoute } = props

  if (selectedRoute === null) return <></>

  const [bus, setBus] = useState([])

  const tripNames = useMemo(() => getTripNamesByRouteId(selectedRoute), [selectedRoute])
  const allStops = useMemo(() => getStopAndTimeByRouteId(selectedRoute), [selectedRoute])
  const relevantBus = useMemo(() => filterRelevantBus(bus, selectedRoute), [selectedRoute])

  const stop_sequences = useMemo(() => Object.keys(allStops), [selectedRoute])

  useEffect(() => {

    const firstFetch = async () => {
      // console.log('first fetch')
      const busData = await getGTFSLiveData(selectedRoute)
      setBus(busData)
    }

    const timer = setInterval(async () => {
      // console.log('interval fetch')
      const busData = await getGTFSLiveData(selectedRoute)
      setBus(busData)
    }, FETCH_TIME_INTERVAL)

    firstFetch()

    return () => clearInterval(timer)

  }, [])


  // console.log(allStops)
  // console.log(stop_sequences)
  // console.log({ relevantBus })
  // console.log({ selectedRoute })

  return (
    <div className="result-right-window">

      {/* Selected Route Header */}
      <RouteHeader selectedRoute={selectedRoute} />

      {/* TripName */}
      {tripNames.map(name =>
        <h2
          className="text-xl lg:text-4xl font-bold my-2"
          key={name}>{name}
        </h2>
      )}

      {/* Route Map */}
      <RouteMap
        selectedRoute={selectedRoute}
        allStops={allStops}
        bus={relevantBus}
      />

      {/* Bus on duty */}
      {Boolean(relevantBus.length) && <div>
        <p>Bus on route:</p>
        {relevantBus.map(({ position, vehicle }) => <li>
          {vehicle.id} ({position.speed} km/h)
        </li>)}

        <hr></hr>
      </div>}


      {/* Each Bus Stop */}
      {stop_sequences.map(stopSeq =>
        <Stop
          key={selectedRoute + stopSeq}
          stopSeq={stopSeq}
          detail={allStops[stopSeq]}
        />
      )}

    </div>
  )
}

function RouteHeader(props) {
  const { selectedRoute } = props

  const isMRTFeeder = getRouteProvider(selectedRoute) === 'MRT_Feeder'
  const isRapidKL = getRouteProvider(selectedRoute) === 'RapidKL'
  const routeNameDisplay = getRouteNameById(selectedRoute)

  return (
    <>
      {isMRTFeeder && <>
        <span className="text-xl lg:text-4xl font-bold outline-2 outline-offset-3 outline-yellow-400 text-yellow-400">
          {routeNameDisplay}
        </span>

        <span className="ms-4 badge badge-xs badge-warning">MRT Feeder</span>
      </>}

      {isRapidKL && <>
        <span className="text-xl lg:text-4xl font-bold outline-2 outline-offset-3 outline-indigo-500 text-indigo-500">
          {routeNameDisplay}
        </span>

        <span className="ms-4 badge badge-sm badge-primary">RapidKL</span>
      </>}
    </>
  )
}
