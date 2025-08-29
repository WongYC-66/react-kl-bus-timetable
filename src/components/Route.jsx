export default function Route(props) {
  const { routeId, name, setSelectedRoute } = props

  const handleClick = () => {
    setSelectedRoute(routeId)
  }


  return (
    <div className="pe-10">
      <button
        className="btn btn-outline btn-warning mb-2 w-full"
        onClick={() => handleClick()}>
          {name}
      </button>
    </div>
  )
}
