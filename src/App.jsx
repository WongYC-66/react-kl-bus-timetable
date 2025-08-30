import { useState } from 'react'
import { getRelevantRoutes } from './util/util'
import LeftResult from './components/LeftResult'
import RightResult from './components/RightResult'
import './style.css'

export default function App() {

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRoute, setSelectedRoute] = useState(null)

  const routes = getRelevantRoutes(searchTerm)

  // console.log({ routes })

  return (
    <div id='container' className='p-4 lg:p-16'>
      <header>
        <h1 className='text-5xl'>KL Bus Timetable (MRT Feeder Bus + RapidKL)</h1>
      </header>

      <main>
        <div className='search-input sticky top-0 inline:block'>
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
            routes={routes}
            setSelectedRoute={setSelectedRoute}
          />
          <RightResult
            selectedRoute={selectedRoute}
          />
        </div>

      </main>

      <footer className='text-center'>
        <p>
          Created by YC_Wong @2025
        </p>

        <p>Disclaimer: Not Live data. Only serves as reference. </p>

        <p className='text-blue-300'>
          <a href='https://github.com/WongYC-66/react-kl-bus-timetable' className='text-decoration-line: underline'>soure code</a>
          <span> </span>
          <a href='https://developer.data.gov.my/realtime-api/gtfs-static' className='text-decoration-line: underline'>data source</a>
          <span> </span>
          <a href='https://myrapidbus.prasarana.com.my/kiosk' className='text-decoration-line: underline'>RapidKL Live</a>
        </p>
      </footer>
    </div>
  )
}
