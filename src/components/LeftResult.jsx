import Route from "./Route"

export default function LeftResult(props) {
  const { routesWithNames, setSelectedRoute } = props

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
