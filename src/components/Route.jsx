import { getRouteProvider } from "../util/util"

export default function Route(props) {
  const { routeId, name, setSelectedRoute } = props

  const isMRTFeeder = getRouteProvider(routeId) === 'MRT_Feeder'
  const isRapidKL = getRouteProvider(routeId) === 'RapidKL'

  const handleClick = () => {
    setSelectedRoute(routeId)
  }

  return (
    <div className="pe-10">
      {isMRTFeeder && <MRTFeederRoute name={name} handleClick={handleClick} />}
      {isRapidKL && <RapidKLRoute name={name} handleClick={handleClick} />}
    </div>
  )
}

function MRTFeederRoute(props) {
  const { name, handleClick } = props
  return (
    <button
      className="btn btn-outline btn-warning mb-2"
      onClick={() => handleClick()}
    >
      <span className="">{name}</span>
      <span className="badge badge-xs badge-warning">MRT</span>
    </button>
  )
}

function RapidKLRoute(props) {
  const { name, handleClick } = props
  return (
    <button
      className="btn btn-outline btn-primary mb-2 w-full"
      onClick={() => handleClick()}
    >
      <span className="">{name}</span>
      <span className="badge badge-xs badge-primary">RapidKL</span>

    </button>
  )
}

