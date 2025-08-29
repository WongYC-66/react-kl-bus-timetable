import { useState } from 'react'
import { getRelevantRoutes, getRouteWithNames } from './util/util'
import LeftResult from './components/LeftResult'
import RightResult from './components/RightResult'
import './style.css'

export default function App() {

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoute, setSelectedRoute] = useState(null)

  const routes = getRelevantRoutes(searchTerm)

  const routesWithNames = getRouteWithNames(routes)

  // console.log({ searchTerm, selectedRoute })

  return (
    <div id='container' className='p-15'>
      <header>
        <h1 className='text-5xl'>KL Bus Timetable (MRT Feeder Bus)</h1>
      </header>

      <main>
        <div className='search-input sticky top-0 '>
          <label>
            Search :
            <input type='text'
              className='input w-full'
              text={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </label>
        </div>

        <div className='result flex mt-5'>
          <LeftResult
            routesWithNames={routesWithNames}
            setSelectedRoute={setSelectedRoute}
          />
          <RightResult
            routesWithNames={routesWithNames}
            selectedRoute={selectedRoute}
          />
        </div>

      </main>

      <footer className='text-center'>
        <p>
          Created by YC_Wong @2025
        </p>
      </footer>
    </div>
  )
}
