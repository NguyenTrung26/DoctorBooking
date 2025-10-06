import { Suspense } from "react";
import BookingClient from "./BookingClient";
export const dynamic = "force-dynamic"
export const revalidate = 0

export default function BookingPage() {
  return (
    <Suspense fallback={<p>Đang tải...</p>}>
      <BookingClient />
    </Suspense>
  );
}
