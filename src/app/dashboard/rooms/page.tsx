import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Users, Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getPaymentStatus, getMonthsOwed } from "@/utils/payment-logic"
import RoomsClientView from "./RoomsClientView"

export default async function RoomsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: rooms } = await supabase.from('rooms').select('*')
    const { data: students } = await supabase.from('students').select('*')
    const { data: payments } = await supabase.from('payments').select('student_id, status')

    // Map students and payments to rooms
    const formattedRooms = rooms?.map(room => {
        const roomStudents = students?.filter(s => s.room_id === room.id) || [];
        const occupants = roomStudents.length;

        let status = "Available";
        if (occupants === 0) status = "Empty";
        if (occupants >= room.capacity) status = "Full";

        const mappedStudents = roomStudents.map(rs => {
            const studentPayments = payments?.filter(p => p.student_id === rs.id && p.status !== 'Overdue') || [];
            const isLate = getPaymentStatus(rs, studentPayments) === 'Late';
            const owed = getMonthsOwed(rs, studentPayments);
            return {
                id: rs.id,
                name: rs.name,
                paymentStatus: isLate ? `Late (${owed} mo)` : 'Up to date'
            }
        });

        return {
            id: room.id,
            type: room.type,
            capacity: room.capacity,
            occupants,
            status,
            students: mappedStudents
        }
    }) || [];

    const unassignedStudents = students?.filter(s => !s.room_id) || [];

    return (
        <RoomsClientView initialRooms={formattedRooms} unassignedStudents={unassignedStudents} />
    )
}
