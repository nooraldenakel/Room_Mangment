import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bed, Users, CreditCard, AlertCircle, Building, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/server"
import { addStudent, addRoom } from "@/app/actions/db"
import { redirect } from "next/navigation"
import { getMonthsOwed } from "@/utils/payment-logic"
import PaymentChart from "@/components/PaymentChart"
import { getTranslation } from "@/lib/i18n/server"

export default async function DashboardPage() {
    const { t } = await getTranslation()
    const supabase = await createClient()

    // Need to make sure user exists for dashboard since it's protected
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: students } = await supabase.from('students').select('*')
    const { data: rooms } = await supabase.from('rooms').select('*')
    const { data: payments } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(5)
    const { data: allPayments } = await supabase.from('payments').select('amount, month, status')

    const studentCount = students?.length || 0;
    const roomCount = rooms?.length || 0;

    const availableRooms = rooms?.filter(room => {
        const occupants = students?.filter(s => s.room_id === room.id).length || 0;
        return occupants < room.capacity;
    }) || [];

    const unassignedStudents = students?.filter(s => !s.room_id) || [];

    const monthlyData = allPayments?.reduce((acc: any, curr: any) => {
        if (curr.status !== 'Overdue' && curr.month) {
            const m = curr.month.substring(0, 3);
            acc[m] = (acc[m] || 0) + curr.amount;
        }
        return acc;
    }, {});

    const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = chartMonths.map(m => ({
        name: m,
        total: monthlyData?.[m] || 0
    }));

    const occupiedBeds = students?.filter(s => s.room_id).length || 0;
    const totalBeds = rooms?.reduce((acc, room) => acc + room.capacity, 0) || 0;

    let overdueAmount = 0;
    const lateStudents = students?.filter(s => {
        const studentPayments = payments?.filter(p => p.student_id === s.id && p.status !== 'Overdue') || [];
        const owed = getMonthsOwed(s, studentPayments);
        if (owed > 0) {
            const avgPayment = studentPayments.length > 0
                ? studentPayments.reduce((acc, p) => acc + p.amount, 0) / studentPayments.length
                : 500; // default estimated rent if they never paid
            overdueAmount += (owed * avgPayment);
            return true;
        }
        return false;
    }) || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t("dashboard.title")}</h1>
                    <p className="text-sm text-slate-500">{t("dashboard.subtitle")}</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Add Student Form */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline"><Plus className="w-4 h-4 mr-2" /> {t("dashboard.add_new_student")}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={addStudent}>
                                <DialogHeader>
                                    <DialogTitle>Add New Student</DialogTitle>
                                    <DialogDescription>Enter the student's details to register them in the system.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                                            <Input id="firstName" name="firstName" placeholder="Alex" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                                            <Input id="lastName" name="lastName" placeholder="Johnson" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                                        <Input id="email" name="email" type="email" placeholder="alex.j@example.com" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="phone" className="text-sm font-medium">Phone</label>
                                            <Input id="phone" name="phone" placeholder="+1 (555) 000-0000" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="university" className="text-sm font-medium">University</label>
                                            <Input id="university" name="university" placeholder="New York University" required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="level" className="text-sm font-medium">Level</label>
                                            <Input id="level" name="level" placeholder="Sophomore" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="college" className="text-sm font-medium">College</label>
                                            <Input id="college" name="college" placeholder="Engineering" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="roomId" className="text-sm font-medium">Assign Room (Optional)</label>
                                        <select id="roomId" name="roomId" className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300">
                                            <option value="">Select an available room</option>
                                            {availableRooms.map((room) => (
                                                <option key={room.id} value={room.id}>
                                                    Room {room.id} ({room.type})
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-500">You can assign a room later if none are available.</p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    {/* Using standard submit button inside server action form */}
                                    <Button type="submit">Save Student</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Create Room Form */}
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button><Plus className="w-4 h-4 mr-2" /> {t("dashboard.create_new_room")}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={addRoom}>
                                <DialogHeader>
                                    <DialogTitle>Create New Room</DialogTitle>
                                    <DialogDescription>Define the capacity and type of the new room.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="roomNumber" className="text-sm font-medium">Room Number / ID</label>
                                            <Input id="roomNumber" name="roomNumber" placeholder="e.g. 305" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="capacity" className="text-sm font-medium">Capacity (Beds)</label>
                                            <Input id="capacity" name="capacity" type="number" placeholder="2" min="1" max="10" defaultValue="2" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="roomType" className="text-sm font-medium">Room Type</label>
                                        <Input id="roomType" name="roomType" placeholder="e.g. Double Studio" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="studentId" className="text-sm font-medium">Assign Student (Optional)</label>
                                        <select id="studentId" name="studentId" className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300">
                                            <option value="none">Leave empty for now</option>
                                            {unassignedStudents.length === 0 && <option value="empty" disabled>No unassigned students available.</option>}
                                            {unassignedStudents.map(student => (
                                                <option key={student.id} value={student.id}>{student.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Create Room</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">{t("common.rooms")}</CardTitle>
                        <Building className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{roomCount}</div>
                        <p className="text-xs text-slate-500 mt-1"><span className="text-green-500 font-medium">System total</span> registered</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">{t("dashboard.occupied_beds")}</CardTitle>
                        <Bed className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{occupiedBeds} <span className="text-sm text-slate-400 font-normal">/ {totalBeds}</span></div>
                        <p className="text-xs text-slate-500 mt-1"><span className="text-green-500 font-medium">+1</span> {t("dashboard.this_month")}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">{t("dashboard.total_students")}</CardTitle>
                        <Users className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{studentCount}</div>
                        <p className="text-xs text-slate-500 mt-1"><span className="text-green-500 font-medium">Active</span> profiles</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">{t("dashboard.overdue_payments")}</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-500">${overdueAmount.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 mt-1"><span className="text-red-500 font-medium">{lateStudents.length}</span> students late</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Payment Analytics</CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 w-full pr-6 pl-2 pb-6">
                        <PaymentChart data={chartData} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {payments?.length === 0 && <p className="text-sm text-slate-500">No recent activity.</p>}
                            {payments?.map((payment: any) => (
                                <div key={payment.id} className="flex items-start gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 mt-0.5 shrink-0">
                                        <CreditCard className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Payment Received</p>
                                        <p className="text-xs text-slate-500 line-clamp-1">Student {payment.student_id} paid ${payment.amount} for {payment.month}</p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(payment.created_at).toISOString().split('T')[0]}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
