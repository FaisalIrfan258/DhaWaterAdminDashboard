"use client"

export default function RecentBookings() {
  // In a real app, you would fetch this data from your API
  const bookings = [
    {
      id: "BOK-1234",
      customer: "John Doe",
      address: "123 Main St, City",
      status: "Pending",
      date: "2023-11-15",
    },
    {
      id: "BOK-1235",
      customer: "Jane Smith",
      address: "456 Oak Ave, Town",
      status: "Confirmed",
      date: "2023-11-14",
    },
    {
      id: "BOK-1236",
      customer: "Robert Johnson",
      address: "789 Pine Rd, Village",
      status: "Completed",
      date: "2023-11-13",
    },
    {
      id: "BOK-1237",
      customer: "Sarah Williams",
      address: "101 Elm Blvd, County",
      status: "Cancelled",
      date: "2023-11-12",
    },
    {
      id: "BOK-1238",
      customer: "Michael Brown",
      address: "202 Maple Dr, District",
      status: "Pending",
      date: "2023-11-11",
    },
  ]

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Recent Bookings</h3>
        <a href="/dashboard/bookings" className="text-sm text-primary hover:underline">
          View all
        </a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium text-muted-foreground">
              <th className="pb-2">ID</th>
              <th className="pb-2">Customer</th>
              <th className="pb-2 hidden md:table-cell">Date</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b last:border-0">
                <td className="py-3 text-sm">{booking.id}</td>
                <td className="py-3 text-sm">
                  <div>{booking.customer}</div>
                  <div className="text-xs text-muted-foreground md:hidden">{booking.date}</div>
                </td>
                <td className="py-3 text-sm hidden md:table-cell">{booking.date}</td>
                <td className="py-3 text-sm">
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      booking.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : booking.status === "Confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : booking.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {booking.status}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

