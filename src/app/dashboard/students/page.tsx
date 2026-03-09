import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Filter, MoreVertical, Eye, Download } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { createClient } from "@/utils/supabase/server"
import { addStudent } from "@/app/actions/db"
import { redirect } from "next/navigation"
import { getPaymentStatus, getMonthsOwed } from "@/utils/payment-logic"

// We are converting this to a Server Component to fetch data securely. 
// For interactive client-features (filtering/modals), we would ideally split this into a `StudentListClient` component.
// To keep things simple and within one file for this demo, we'll stream data to a smaller Client wrapper,
// or use basic server-rendered lists. Given the interactive constraints, let's build the basic server shell 
// and pass data to a Client component.

import StudentsClientView from "./StudentsClientView"

export default async function StudentsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: students } = await supabase.from('students').select('*')
    const { data: payments } = await supabase.from('payments').select('student_id, amount, status')
    const { data: rooms } = await supabase.from('rooms').select('*')

    // Map payment status roughly
    const formattedStudents = students?.map(s => {
        const studentPayments = payments?.filter(p => p.student_id === s.id && p.status !== 'Overdue') || [];
        const isLate = getPaymentStatus(s, studentPayments) === 'Late';
        const owed = getMonthsOwed(s, studentPayments);

        return {
            id: s.id,
            name: s.name,
            email: s.email,
            phone: s.phone,
            university: s.university,
            level: s.level,
            college: s.college,
            room: s.room_id ? `${s.room_id}` : 'Unassigned',
            status: s.status,
            payment: isLate ? `Late (${owed} mo)` : 'Up to date',
            totalPayments: studentPayments.length
        }
    }) || [];

    const availableRooms = rooms?.filter(room => {
        const occupants = students?.filter(s => s.room_id === room.id).length || 0;
        return occupants < room.capacity;
    }) || [];

    return (
        <StudentsClientView initialStudents={formattedStudents} availableRooms={availableRooms} />
    )
}
