import { useMemo } from "react"
import { getStopAndTimeByRouteId, getTripNamesByRouteId } from "../util/util"
import Stop from "./Stop"

export default function RightResult(props) {
  const { selectedRoute } = props

  if (selectedRoute === null) return <></>

  const tripNames = useMemo(() => getTripNamesByRouteId(selectedRoute), [selectedRoute])
  const allStops = useMemo(() => getStopAndTimeByRouteId(selectedRoute), [selectedRoute])

  const stop_sequences = useMemo(() => Object.keys(allStops), [selectedRoute])

  // continue here -
  // 1. stop.jsx - show times
  // 2. problem - StopStation not in order like Pulse, T114

  // console.log(allStops)

  return (
    <div className="result-right-window w-1/2">

      {/* TripName */}
      {tripNames.map(name =>
        <h2 
          className="text-4xl font-bold"
          key={name}>{name}
        </h2>
      )}

      {/* Each Bus Stop */}
      {stop_sequences.map(stopSeq =>
        <Stop
          key={stopSeq}
          stopSeq={stopSeq}
          detail={allStops[stopSeq]}
        />
      )}

    </div>
  )
}
