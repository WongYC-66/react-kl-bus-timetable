export default function Stop(props) {
  const { stopSeq, detail } = props
  const { arrival_times, stop_code, stop_name, stop_id } = detail

  const convertedArrivalTimes = arrival_times
    .sort()
    .map(time => {
      return time.startsWith('24') ? time.replace('24', '00') : time  // 24:15:00 -> 00:15:00
    })
    .map(time => {
      // return time
      return new Date(`2024-01-01T${time}+08:00`)
        .toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" })  // 00:15:00 -> 12:15 am
    })

  const uniqueArrivalTimes = [...new Set(convertedArrivalTimes)]

  // console.log(arrival_times)

  return (
    <div className="my-5">
      <p className="text-xl font-bold">
        {stopSeq} - {stop_name} - {stop_code}
      </p>

      <div>
        {uniqueArrivalTimes.map(time =>
          <span
            key={stopSeq + stop_code + time}>
            {time} |
          </span>
        )}

      </div>
    </div>
  )
}
