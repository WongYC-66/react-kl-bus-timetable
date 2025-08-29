import { useState } from "react";

export default function Stop(props) {

  const { stopSeq, detail } = props
  const { arrival_times, stop_code, stop_name, stop_id } = detail

  const [showAll, setShowAll] = useState(false)

  const nowUtc8 = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));

  // "14:06:44"
  const nowTime = nowUtc8.toLocaleTimeString("en-GB", {
    hour12: false,
    timeZone: "Asia/Kuala_Lumpur"
  });

  const convertedArrivalTimes = arrival_times
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

  const uniqueArrivalTimes = [...new Set(convertedArrivalTimes)]

  // console.log(arrival_times)

  const handleStopClick = () => {
    setShowAll(prev => !prev)
  }

  return (
    <div className="my-5" onClick={handleStopClick}>
      <p className="text-xl font-bold">
        {stopSeq} - {stop_name} - {stop_code}
      </p>

      <div className="grid gap-1 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] ps-12">
        {uniqueArrivalTimes.map(({ expired, display }) => {

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
    </div>
  )
}
