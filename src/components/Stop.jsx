import { useMemo, useState } from "react";

export default function Stop(props) {

  const { stopSeq, detail } = props
  const { arrival_times, stop_code, stop_name, stop_id } = detail

  const [showAll, setShowAll] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)

  const formattedArrivalTimes = useMemo(() => formatArrivalTime(arrival_times), [stop_name])

  const uniqueArrivalTimes = useMemo(() => filterToUnique(formattedArrivalTimes), [stop_name])

  const handleStopClick = () => {
    setShowSchedule(prev => !prev)
  }

  const handleViewMoreBtnClick = () => {
    setShowAll(prev => !prev)
  }

  // console.log({ arrival_times })

  return (
    <div className="my-5" >
      {/* Stop name */}
      <h2 className={`${showSchedule ? 'font-bold text-xl' : 'text-lg'} `} onClick={handleStopClick}>
        {stopSeq} - {stop_name} {stop_code && `- ${stop_code}`}
      </h2>

      {/* Grid of Arrival times */}
      <div
        className="grid gap-1 grid-cols-[repeat(auto-fill,minmax(75px,1fr))]
       lg:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] lg:ps-12"
        onClick={handleStopClick}
      >
        {showSchedule && uniqueArrivalTimes.map(({ expired, display }) => {

          let toShow = showAll || !expired

          return (
            <div
              key={stopSeq + stop_code + display}
              className={`${!toShow && 'hidden'} ${expired && 'opacity-25'}`}
            >
              {display}
            </div>
          )
        })}

      </div>

      {/* Button */}
      <div className="flex justify-center mt-3">
        {showSchedule &&
          <button className="btn btn-soft" onClick={handleViewMoreBtnClick}>
            View {showAll ? 'Less' : 'More'}
          </button>
        }
      </div>

    </div>
  )
}


const formatArrivalTime = (arrival_times) => {
  const nowUtc8 = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));

  // "14:06:44"
  const nowTime = nowUtc8.toLocaleTimeString("en-GB", {
    hour12: false,
    timeZone: "Asia/Kuala_Lumpur"
  });

  return arrival_times
    .map(time => time.padStart(8, '0'))
    .sort()
    .map(time => ({ time, expired: nowTime >= time }))
    .map(({ time, ...rest }) => ({
      ...rest,
      time: time.startsWith('24') ? time.replace('24', '00') : time,  //  24:15:00 -> 00:15:00
    }))
    .map(({ time, ...rest }) => ({
      ...rest,
      display: new Date(`2024-01-01T${time}+08:00`).toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }),  // 00:15:00 -> 12:15 am
    }))
}

const filterToUnique = (convertedArrivalTimes) => {
  const seen = new Set()
  const res = []

  for (let { display, ...rest } of convertedArrivalTimes) {
    if (seen.has(display)) continue
    seen.add(display)
    res.push({ ...rest, display })
  }

  return res
}