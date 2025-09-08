import RoomClient from "./RoomClient"

type Props = { params: { room: string } }

export default function Page({ params }: Props) {
  return <RoomClient room={params.room} />
}
