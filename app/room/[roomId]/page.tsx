import { notFound } from "next/navigation";

import { RoomClientPage } from "@/components/room/room-client-page";
import { normalizeRoomId } from "@/lib/utils/room";

type RoomPageProps = {
  params: Promise<{
    roomId: string;
  }>;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const { roomId } = await params;
  const normalizedRoomId = normalizeRoomId(roomId);

  if (!normalizedRoomId) {
    notFound();
  }

  return <RoomClientPage roomId={normalizedRoomId} />;
}
