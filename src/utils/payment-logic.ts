export function getPaymentStatus(student: { move_in_date?: string | null }, studentPayments: any[]): 'Up to date' | 'Late' {
    const moveIn = student.move_in_date ? new Date(student.move_in_date) : new Date(2024, 7, 1);
    const now = new Date();

    // Calculate difference in months (inclusive of moving-in month)
    let monthsElapsed = (now.getFullYear() - moveIn.getFullYear()) * 12 + (now.getMonth() - moveIn.getMonth());

    // Minimum 1 month owed upon move-in, plus past months
    monthsElapsed = Math.max(1, monthsElapsed + 1);

    const paidMonths = studentPayments.length;

    return paidMonths < monthsElapsed ? 'Late' : 'Up to date';
}

export function getMonthsOwed(student: { move_in_date?: string | null }, studentPayments: any[]): number {
    const moveIn = student.move_in_date ? new Date(student.move_in_date) : new Date(2024, 7, 1);

    const now = new Date();

    let monthsElapsed = (now.getFullYear() - moveIn.getFullYear()) * 12 + (now.getMonth() - moveIn.getMonth());
    monthsElapsed = Math.max(1, monthsElapsed + 1);

    return Math.max(0, monthsElapsed - studentPayments.length);
}
