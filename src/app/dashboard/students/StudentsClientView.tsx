"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Download, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { addStudent, checkoutStudent } from "@/app/actions/db"
import { useLanguage } from "@/lib/i18n/LanguageContext"

export default function StudentsClientView({ initialStudents, availableRooms }: { initialStudents: any[], availableRooms: any[] }) {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");

    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [confirmCheckout, setConfirmCheckout] = useState<string | null>(null);

    const filteredStudents = useMemo(() => {
        return initialStudents.filter(student => {
            const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.university.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === "All" || student.status === statusFilter;

            let matchesPayment = true;
            if (paymentFilter === "Up to date") matchesPayment = student.payment === "Up to date" || student.payment === "Settled";
            if (paymentFilter === "Late") matchesPayment = student.payment.includes("Late");

            return matchesSearch && matchesStatus && matchesPayment;
        });
    }, [initialStudents, searchQuery, statusFilter, paymentFilter]);

    const exportToCSV = () => {
        const headers = ["ID", "Name", "Email", "Phone", "University", "Room", "Status", "Payment"];
        const csvContent = [
            headers.join(","),
            ...filteredStudents.map(s => `"${s.id}","${s.name}","${s.email}","${s.phone}","${s.university}","${s.room}","${s.status}","${s.payment}"`)
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "students_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{t("students_page.title")}</h1>
                    <p className="text-sm text-slate-500">{t("students_page.subtitle")}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="w-4 h-4 mr-2" /> {t("students_page.add_student")}</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={(formData) => {
                                addStudent(formData);
                                setIsAddStudentOpen(false);
                            }}>
                                <DialogHeader>
                                    <DialogTitle>Add New Student</DialogTitle>
                                    <DialogDescription>Enter the student's details to register them in the system.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">First Name</label>
                                            <Input name="firstName" placeholder="Alex" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Last Name</label>
                                            <Input name="lastName" placeholder="Johnson" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email Address</label>
                                        <Input name="email" type="email" placeholder="alex.j@example.com" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Phone</label>
                                            <Input name="phone" placeholder="+1 (555) 000-0000" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">University</label>
                                            <Input name="university" placeholder="New York University" required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Level</label>
                                            <Input name="level" placeholder="Sophomore" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">College</label>
                                            <Input name="college" placeholder="Engineering" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Assign Room (Optional)</label>
                                        <Select name="roomId">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an available room" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableRooms.map((room) => (
                                                    <SelectItem key={room.id} value={room.id}>
                                                        Room {room.id} ({room.type})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-slate-500">You can assign a room later if none are available.</p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" type="button" onClick={() => setIsAddStudentOpen(false)}>Cancel</Button>
                                    <Button type="submit">Save Student</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder={t("students_page.search_placeholder")}
                                className="pl-9 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder={t("students_page.housing_status")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Statuses</SelectItem>
                                    <SelectItem value="Active">Active</SelectItem>
                                    <SelectItem value="Moved Out">Moved Out</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder={t("students_page.payment_status")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Payments</SelectItem>
                                    <SelectItem value="Up to date">Up to date</SelectItem>
                                    <SelectItem value="Late">Late / Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={exportToCSV}>
                        <Download className="w-4 h-4 mr-2" /> {t("students_page.export")}
                    </Button>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t("students_page.table.student")}</TableHead>
                                <TableHead>{t("students_page.table.room_bed")}</TableHead>
                                <TableHead>{t("students_page.table.university")}</TableHead>
                                <TableHead>{t("students_page.table.status")}</TableHead>
                                <TableHead>{t("students_page.table.payment")}</TableHead>
                                <TableHead className="text-right">{t("students_page.table.actions")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        {t("students_page.table.no_results")}
                                    </TableCell>
                                </TableRow>
                            ) : filteredStudents.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{student.name}</div>
                                        <div className="text-xs text-slate-500">{student.id} • {student.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-700 dark:text-slate-300">{student.room}</div>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                                        {student.university}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            student.status === 'Active' ? 'success' : 'secondary'
                                        }>
                                            {student.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={student.payment.includes('Late') ? 'destructive' : 'success'}>
                                            {student.payment}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" className="h-8 px-3" onClick={() => setSelectedStudent(student)}>
                                            <Eye className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                                            {t("students_page.table.view")}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* View Details Dialog */}
            <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudent(null)}>
                <DialogContent className="sm:max-w-2xl lg:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Student Profile Details</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        {selectedStudent && (
                            <div className="flex flex-col sm:flex-row gap-6">
                                <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900/30 flex-shrink-0 flex items-center justify-center text-3xl font-bold text-primary-600 mx-auto sm:mx-0">
                                    {selectedStudent.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div className="flex-1 space-y-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="text-center sm:text-left w-full sm:w-auto">
                                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h3>
                                            <p className="text-sm text-slate-500">{selectedStudent.university} • ID: {selectedStudent.id}</p>
                                        </div>
                                        <Badge variant={selectedStudent.status === 'Active' ? 'success' : 'secondary'} className="mx-auto sm:mx-0">
                                            {selectedStudent.status}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-4">
                                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Contact</span>
                                            <p className="font-medium text-slate-900 dark:text-white">{selectedStudent.phone}</p>
                                            <p className="text-primary-600 mt-1 truncate" title={selectedStudent.email}>{selectedStudent.email}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Academics</span>
                                            <p className="font-medium text-slate-900 dark:text-white">Level: {selectedStudent.level}</p>
                                            <p className="text-slate-600 dark:text-slate-400 mt-1">College: {selectedStudent.college}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">Housing details</span>
                                            <p className="font-medium text-slate-900 dark:text-white">Room {selectedStudent.room}</p>
                                            <div className={`mt-2 font-medium flex items-center gap-2 ${selectedStudent.payment.includes('Late') ? "text-red-600" : "text-green-600"}`}>
                                                Status: <Badge variant={selectedStudent.payment.includes('Late') ? 'destructive' : 'success'}>{selectedStudent.payment}</Badge>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-2">Total Payments: <strong>{selectedStudent.totalPayments}</strong></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close</Button>
                        <Button
                            variant="danger"
                            disabled={selectedStudent?.room !== 'Unassigned' || selectedStudent?.payment.includes('Late')}
                            onClick={() => setConfirmCheckout(selectedStudent?.id)}
                        >
                            Move Out / Checkout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!confirmCheckout} onOpenChange={(open) => !open && setConfirmCheckout(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Move Out</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to officially check out this student? Their status will permanently be marked as "Moved Out".
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmCheckout(null)}>Cancel</Button>
                        <Button variant="danger" onClick={async () => {
                            if (confirmCheckout) {
                                await checkoutStudent(confirmCheckout);
                                setConfirmCheckout(null);
                                setSelectedStudent(null);
                            }
                        }}>Confirm Checkout</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
