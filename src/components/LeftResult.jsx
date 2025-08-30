import { getRouteWithNames } from "../util/util"
import Route from "./Route"

export default function LeftResult(props) {
  const { routes, setSelectedRoute } = props
  const routesWithNames = getRouteWithNames(routes)

  return (
    <div className="result-left-window w-1/3">
      {routesWithNames.map(({ routeId, name }) =>
        <Route
          key={routeId}
          routeId={routeId}
          name={name}
          setSelectedRoute={setSelectedRoute}
        />)}
    </div>
  )
}
