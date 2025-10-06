import { Suspense } from "react";
import BookingClient from "./BookingClient";

export default function BookingPage() {
  return (
    <Suspense fallback={<p>Đang tải...</p>}>
      <BookingClient />
    </Suspense>
  );
}
