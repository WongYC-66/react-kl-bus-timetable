import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Popup, Polygon, CircleMarker, useMap } from 'react-leaflet'
import "leaflet/dist/leaflet.css";

import { addGeoInfo, getCenterLocation, toArrayOfStopObj } from '../util/util';

// Refer from : https://react-leaflet.js.org/docs/example-vector-layers/

export default function RouteMap(props) {

  const { selectedRoute, allStops } = props

  const allStopsWithGeo = useMemo(() => addGeoInfo(allStops), [selectedRoute])
  const allStopsArr = toArrayOfStopObj(allStopsWithGeo)

  // plot Route shape
  const stopPositions = allStopsArr.map(({ lat, lon }) => [lat, lon])
  const purpleOptions = { color: 'purple' }

  // map centering
  const [centerLatitude, centerLongitude] = getCenterLocation(stopPositions)

  // plot stop marker
  const redOptions = { color: 'red' }

  // console.log("map rendered")
  // console.log({ allStopsArr, stopPositions })
  // console.log({ centerLatitude, centerLongitude })

  return (
    // Make sure you set the height and width of the map container otherwise the map won't show
    <MapContainer center={[centerLatitude, centerLongitude]} zoom={15} className='w-full h-64'>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Additional map layers or components can be added here */}

      {/* fix map not recentering when selectedRoute changed */}
      <RecenterMap center={[centerLatitude, centerLongitude]} />
      <FitBounds positions={stopPositions} />

      {/* Route Polygon label */}
      <Polygon pathOptions={purpleOptions} positions={stopPositions} />

      {/* Each stop = 1 circle marker */}
      {allStopsArr.map(({ lat, lon, stopSeq, stop_name, stop_code, stop_id }) =>
        <CircleMarker center={[lat, lon]} pathOptions={redOptions} radius={2}>
          <Popup>{stopSeq} - {stop_name}</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}

// thanks chatGPT for following
function RecenterMap({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center);
    }
  }, [center, map]);

  return null;
}

function FitBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions && positions.length > 0) {
      map.fitBounds(positions); // Leaflet will pick zoom + center automatically
    }
  }, [positions, map]);

  return null;
}