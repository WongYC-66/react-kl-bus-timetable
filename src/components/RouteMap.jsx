import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Popup, Polygon, CircleMarker, Marker, useMap } from 'react-leaflet'
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import busIconFile from "../assets/bus_icon.png";

import { addGeoInfo, getCenterLocation, toArrayOfStopObj } from '../util/util';

// Refer from : https://react-leaflet.js.org/docs/example-vector-layers/

export default function RouteMap(props) {

  const { selectedRoute, allStops, bus } = props

  const allStopsWithGeo = useMemo(() => addGeoInfo(allStops), [selectedRoute])
  const allStopsArr = toArrayOfStopObj(allStopsWithGeo)

  // plot Route shape
  const stopPositions = useMemo(() => allStopsArr.map(({ lat, lon }) => [lat, lon]), [selectedRoute])
  const purpleOptions = { color: 'purple' }

  // map centering
  const [centerLatitude, centerLongitude] = useMemo(() => getCenterLocation(stopPositions, [selectedRoute]))

  // plot stop marker
  const redOptions = { color: 'red' }

  // Custom Bus Icon
  const busIcon = new L.Icon({
    iconUrl: busIconFile,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });

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
      <FitBounds positions={stopPositions} selectedRoute={selectedRoute} />

      {/* Route Polygon label */}
      <Polygon pathOptions={purpleOptions} positions={stopPositions} />

      {/* Each stop = 1 circle marker */}
      {allStopsArr.map(({ lat, lon, stopSeq, stop_name, stop_code, stop_id }) =>
        <CircleMarker center={[lat, lon]} pathOptions={redOptions} radius={2}>
          <Popup>{stopSeq} - {stop_name}</Popup>
        </CircleMarker>
      )}

      {/* Bus marker */}
      {Boolean(bus.length) && bus.map(({ position, vehicle }) =>
        <Marker position={[position.latitude, position.longitude]} icon={busIcon}>
          <Popup>{vehicle.id} ({position.speed.toFixed(1)} km/h)</Popup>
        </Marker>
      )}

    </MapContainer>
  );
}

// thanks chatGPT for following
function FitBounds({ positions, selectedRoute }) {
  const map = useMap();

  useEffect(() => {
    if (positions && positions.length > 0) {
      map.fitBounds(positions); // Leaflet will pick zoom + center automatically
    }
    // }, [positions, map]);
  }, [selectedRoute]);

  return null;
}

