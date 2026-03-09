import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Download, FileText, Bell, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

import PaymentsClientView from "@/app/dashboard/payments/PaymentsClientView"

export default async function PaymentsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: payments } = await supabase.from('payments').select('*, students(id, name, room_id)')
    const { data: students } = await supabase.from('students').select('id, name')

    const formattedPayments = payments?.map(p => ({
        id: p.id.split('-')[0].toUpperCase(), // Just a short display ID
        student: p.students?.name || "Unknown",
        room: p.students?.room_id || "Unassigned",
        amount: p.amount,
        date: new Date(p.payment_date).toISOString().split('T')[0],
        status: p.status,
        month: p.month,
        db_id: p.id // The actual UUID
    })) || [];

    return (
        <PaymentsClientView initialPayments={formattedPayments} availableStudents={students || []} />
    )
}
