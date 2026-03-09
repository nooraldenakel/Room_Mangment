import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Download, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { getMonthsOwed } from "@/utils/payment-logic"
import PaymentChart from "@/components/PaymentChart"
import OccupancyChart from "@/components/OccupancyChart"
import ReportsExportButton from "@/components/ReportsExportButton"

export default async function ReportsPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: rooms } = await supabase.from('rooms').select('id, capacity, status, type')
    const { data: students } = await supabase.from('students').select('id, room_id, move_in_date')
    const { data: payments } = await supabase.from('payments').select('student_id, amount, status, month')

    let totalRevenue = 0;
    let totalPayments = 0;
    let overduePaymentsTotal = 0;

    // Revenue calculation from actual paid records
    payments?.forEach(p => {
        if (p.status !== 'Overdue') {
            totalPayments++;
            totalRevenue += p.amount;
        }
    })

    // Overdue calculation based on move_in_date elapsed vs actual payments
    students?.forEach(s => {
        const studentPayments = payments?.filter(p => p.student_id === s.id && p.status !== 'Overdue') || [];
        const owed = getMonthsOwed(s, studentPayments);
        overduePaymentsTotal += owed;
    });

    // Total expected payments is what has been paid + what is overdue
    const totalExpected = totalPayments + overduePaymentsTotal;
    const overdueRate = totalExpected > 0 ? ((overduePaymentsTotal / totalExpected) * 100).toFixed(1) : "0.0";

    const totalCapacity = rooms?.reduce((acc, room) => acc + room.capacity, 0) || 0;
    const occupiedBeds = students?.filter(s => s.room_id).length || 0;
    const occupancyRate = totalCapacity > 0 ? ((occupiedBeds / totalCapacity) * 100).toFixed(1) : "0.0";

    // Chart Data Preparation
    const monthlyData = payments?.reduce((acc: any, curr: any) => {
        if (curr.status !== 'Overdue' && curr.month) {
            const m = curr.month.substring(0, 3);
            acc[m] = (acc[m] || 0) + curr.amount;
        }
        return acc;
    }, {});

    const chartMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = chartMonths.map(m => ({
        name: m,
        total: monthlyData?.[m] || 0
    }));

    const occupancyDataMap = rooms?.reduce((acc: any, room: any) => {
        const type = room.type || 'Standard';
        const occupants = students?.filter(s => s.room_id === room.id).length || 0;
        acc[type] = (acc[type] || 0) + occupants;
        return acc;
    }, {});

    const occupancyData = Object.keys(occupancyDataMap || {}).map(key => ({
        name: key,
        value: occupancyDataMap[key]
    }));


    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reports & Analytics</h1>
                    <p className="text-sm text-slate-500">View comprehensive financial and operational reports.</p>
                </div>
                <div className="flex items-center gap-2">
                    <ReportsExportButton />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
                        <BarChart3 className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">${totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 mt-1">Lifetime collections</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Occupancy Rate</CardTitle>
                        <CheckCircle className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{occupancyRate}%</div>
                        <p className="text-xs text-slate-500 mt-1">{occupiedBeds} out of {totalCapacity} beds filled</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Average Stay</CardTitle>
                        <Clock className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">8.5 <span className="text-sm font-normal text-slate-500">Mos</span></div>
                        <p className="text-xs text-slate-500 mt-1">Consistent with average</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Overdue Rate</CardTitle>
                        <AlertCircle className="h-4 w-4 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{overdueRate}%</div>
                        <p className="text-xs text-slate-500 mt-1">{overduePaymentsTotal} outstanding monthly payments</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Revenue Forecast</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full pr-6 pl-2 pb-6">
                        <PaymentChart data={revenueData} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Occupancy by Room Type</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full pb-6">
                        <OccupancyChart data={occupancyData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
