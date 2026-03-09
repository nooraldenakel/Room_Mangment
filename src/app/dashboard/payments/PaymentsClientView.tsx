"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Plus, Download, FileText, Bell, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { recordPayment, deletePayment, editPaymentAction } from "@/app/actions/db"
import { useFormStatus } from "react-dom"
import { Trash2, Edit2 } from "lucide-react"

const ALL_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function PaymentsClientView({ initialPayments, availableStudents }: { initialPayments: any[], availableStudents: any[] }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("all");

    const [remindersSent, setRemindersSent] = useState<string[]>([]);
    const [receiptViewing, setReceiptViewing] = useState<any>(null);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const filteredPayments = initialPayments.filter(p => {
        const matchesSearch = p.student.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMonth = selectedMonth === "all" || p.month === selectedMonth;
        return matchesSearch && matchesMonth;
    });

    const totalCollected = initialPayments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
    const totalOverdue = initialPayments.filter(p => p.status === 'Overdue').reduce((acc, p) => acc + p.amount, 0);

    const handleSendReminder = (paymentId: string) => {
        setRemindersSent(prev => [...prev, paymentId]);
        setTimeout(() => {
            alert("Reminder email sent to student successfully!");
        }, 500);
    };

    const handleExportCSV = () => {
        const headers = ["Transaction ID", "Student Name", "Room", "Amount", "Month", "Status", "Date"];
        const rows = filteredPayments.map(p => [p.id, p.student, p.room, p.amount, p.month, p.status, p.date]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "payments_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadReceipt = () => {
        if (!receiptViewing) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Receipt ${receiptViewing.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 40px; color: #333; }
                        .header { text-align: center; margin-bottom: 40px; }
                        .amount { font-size: 32px; font-weight: bold; }
                        .details { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 20px; }
                        .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>Payment Receipt</h2>
                        <div class="amount">$${receiptViewing.amount}</div>
                        <p style="text-transform: capitalize;">${receiptViewing.month} Rent</p>
                    </div>
                    <div class="details">
                        <div class="row"><span>Transaction ID:</span> <strong>${receiptViewing.id}</strong></div>
                        <div class="row"><span>Student:</span> <strong>${receiptViewing.student}</strong></div>
                        <div class="row"><span>Room:</span> <strong>${receiptViewing.room}</strong></div>
                        <div class="row"><span>Date:</span> <strong>${receiptViewing.date}</strong></div>
                    </div>
                    <script>window.onload = () => window.print();</script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Payment Tracking</h1>
                    <p className="text-sm text-slate-500">Monitor monthly rent payments and outstanding balances.</p>
                </div>
                <div className="flex items-center gap-2">

                    <Dialog open={isRecordPaymentOpen} onOpenChange={setIsRecordPaymentOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="w-4 h-4 mr-2" /> Record Payment</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <form action={(formData) => {
                                recordPayment(formData);
                                setIsRecordPaymentOpen(false);
                            }}>
                                <DialogHeader>
                                    <DialogTitle>Record Manual Payment</DialogTitle>
                                    <DialogDescription>Enter payment details manually collected from a student.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Student Name</label>
                                        <Select name="student_id" required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select student..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableStudents.map(student => (
                                                    <SelectItem key={student.id} value={student.id}>{student.name} (ID: {student.id})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Amount Received</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-slate-500 font-medium">$</span>
                                                <Input name="amount" type="number" placeholder="1000" className="pl-7" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Payment Date</label>
                                            <Input type="date" disabled value={new Date().toISOString().split('T')[0]} />
                                            <p className="text-[10px] text-slate-500 mt-1">Date is automatically recorded as today.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Target Month</label>
                                        <Select name="month" defaultValue={new Date().toLocaleString('default', { month: 'long' })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Month" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ALL_MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" type="button" onClick={() => setIsRecordPaymentOpen(false)}>Cancel</Button>
                                    <Button type="submit">Record & Generate Receipt</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-900/50">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-primary-600 dark:text-primary-400">Total Collected</h3>
                        <div className="text-3xl font-bold text-primary-900 dark:text-primary-300 mt-2">${totalCollected.toLocaleString()}</div>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Outstanding Balance</h3>
                        <div className="text-3xl font-bold text-red-700 dark:text-red-500 mt-2">${totalOverdue.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                placeholder="Search transactions or students..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="w-40">
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Months</SelectItem>
                                    {ALL_MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                </div>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                        No payment records found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredPayments.map((payment) => (
                                <TableRow key={payment.id}>
                                    <TableCell>
                                        <div className="font-medium text-slate-900 dark:text-slate-100">{payment.id}</div>
                                        <div className="text-xs text-slate-500 capitalize">{payment.month} Rent</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-900 dark:text-slate-100">{payment.student}</div>
                                        <div className="text-xs text-slate-500">Room: {payment.room}</div>
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-900 dark:text-white">
                                        ${payment.amount.toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={payment.status === 'Paid' ? 'success' : 'destructive'}>
                                            {payment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {payment.date}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-1">
                                        {payment.status === 'Paid' ? (
                                            <Button variant="ghost" size="sm" onClick={() => setReceiptViewing(payment)}>
                                                <FileText className="w-4 h-4 mr-2 text-slate-400" />
                                                Receipt
                                            </Button>
                                        ) : (
                                            <Button
                                                variant={remindersSent.includes(payment.id) ? "ghost" : "outline"}
                                                size="sm"
                                                onClick={() => handleSendReminder(payment.id)}
                                                disabled={remindersSent.includes(payment.id)}
                                                className={remindersSent.includes(payment.id) ? "text-green-600" : "text-amber-600 border-amber-200 hover:bg-amber-50"}
                                            >
                                                {remindersSent.includes(payment.id) ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
                                                {remindersSent.includes(payment.id) ? "Sent" : "Remind"}
                                            </Button>
                                        )}
                                        <Button variant="ghost" size="sm" className="px-2" onClick={() => setEditingPayment(payment)}>
                                            <Edit2 className="w-4 h-4 text-slate-400" />
                                        </Button>
                                        <Button variant="ghost" size="sm" className="px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setConfirmDelete(payment.db_id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow className="bg-slate-50 dark:bg-slate-900 font-bold border-t-2 border-slate-200 dark:border-slate-800">
                                <TableCell colSpan={2} className="text-right">Total Filtered Sum:</TableCell>
                                <TableCell colSpan={4}>${filteredPayments.reduce((sum, p) => sum + (p.status === 'Paid' ? p.amount : 0), 0).toLocaleString()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Payment Dialog */}
            <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
                <DialogContent>
                    <form action={(formData) => {
                        editPaymentAction(formData);
                        setEditingPayment(null);
                    }}>
                        <DialogHeader>
                            <DialogTitle>Edit Payment Details</DialogTitle>
                            <DialogDescription>Modify the transaction amount or target month.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <input type="hidden" name="paymentId" value={editingPayment?.db_id || ''} />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Amount</label>
                                <Input name="amount" type="number" defaultValue={editingPayment?.amount} required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Target Month</label>
                                <Select name="month" defaultValue={editingPayment?.month}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ALL_MONTHS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setEditingPayment(null)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Payment</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this payment record entirely? This will affect the student's status.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                        <Button variant="danger" onClick={async () => {
                            if (confirmDelete) await deletePayment(confirmDelete);
                            setConfirmDelete(null);
                        }}>Yes, delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Receipt Dialog */}
            <Dialog open={!!receiptViewing} onOpenChange={(open) => !open && setReceiptViewing(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Payment Receipt</DialogTitle>
                        <DialogDescription>Transaction {receiptViewing?.id}</DialogDescription>
                    </DialogHeader>
                    <div className="py-6 flex flex-col items-center border-y border-slate-100 dark:border-slate-800 my-4 text-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                            <CheckCircle2 className="text-green-600 w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">${receiptViewing?.amount}</h2>
                        <p className="text-slate-500 capitalize">{receiptViewing?.month} Rent successfully paid</p>

                        <div className="w-full text-left bg-slate-50 dark:bg-slate-900 p-4 rounded-xl mt-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Student</span>
                                <span className="font-medium text-slate-900 dark:text-white">{receiptViewing?.student}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Room</span>
                                <span className="font-medium text-slate-900 dark:text-white">{receiptViewing?.room}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Date</span>
                                <span className="font-medium text-slate-900 dark:text-white">{receiptViewing?.date}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                        <Button variant="outline" onClick={() => setReceiptViewing(null)}>Close</Button>
                        <Button onClick={handleDownloadReceipt}><Download className="w-4 h-4 mr-2" /> Download Document</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
