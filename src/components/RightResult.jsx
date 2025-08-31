import { useMemo } from "react"
import { getRouteNameById, getRouteProvider, getStopAndTimeByRouteId, getTripNamesByRouteId } from "../util/util"
import Stop from "./Stop"
import RouteMap from "./RouteMap"

export default function RightResult(props) {
  const { selectedRoute } = props

  if (selectedRoute === null) return <></>

  const tripNames = useMemo(() => getTripNamesByRouteId(selectedRoute), [selectedRoute])
  const allStops = useMemo(() => getStopAndTimeByRouteId(selectedRoute), [selectedRoute])

  const stop_sequences = useMemo(() => Object.keys(allStops), [selectedRoute])


  // console.log(allStops)
  // console.log(stop_sequences)

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
      />

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
