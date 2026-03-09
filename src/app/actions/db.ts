'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addStudent(formData: FormData) {
    const supabase = await createClient()

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const university = formData.get('university') as string
    const phone = formData.get('phone') as string
    const level = formData.get('level') as string
    const college = formData.get('college') as string
    const roomId = formData.get('roomId') as string

    const id = `S-${Math.floor(Math.random() * 10000)}`

    const { error } = await supabase
        .from('students')
        .insert([
            {
                id,
                name: `${firstName} ${lastName}`,
                email,
                phone,
                university,
                level,
                college,
                room_id: roomId || null,
                status: 'Active',
                move_in_date: roomId ? new Date().toISOString() : null
            },
        ])

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/students')
    revalidatePath('/dashboard')
}

export async function addRoom(formData: FormData) {
    const supabase = await createClient()

    const roomId = formData.get('roomNumber') as string
    const capacity = parseInt(formData.get('capacity') as string) || 2
    const roomType = formData.get('roomType') as string
    const studentId = formData.get('studentId') as string

    if (!roomId || !roomType) throw new Error("Missing required fields")

    const { error } = await supabase
        .from('rooms')
        .insert([
            {
                id: roomId,
                type: roomType,
                capacity: capacity,
                status: 'Empty'
            },
        ])

    if (error) throw new Error(error.message)

    if (studentId && studentId !== 'none') {
        const { data: studentData } = await supabase.from('students').select('move_in_date').eq('id', studentId).single();
        const updateData: any = {
            room_id: roomId,
            status: 'Active'
        };
        if (!studentData?.move_in_date) {
            updateData.move_in_date = new Date().toISOString();
        }
        await supabase
            .from('students')
            .update(updateData)
            .eq('id', studentId)
    }

    revalidatePath('/dashboard/rooms')
    revalidatePath('/dashboard')
}

export async function recordPayment(formData: FormData) {
    const supabase = await createClient()

    const student_id = formData.get('student_id') as string
    const amount = parseFloat(formData.get('amount') as string)
    const month = formData.get('month') as string

    const { error } = await supabase
        .from('payments')
        .insert([
            {
                student_id,
                amount,
                status: 'Paid',
                month
            },
        ])

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard')
}

export async function assignStudentToRoom(formData: FormData) {
    const supabase = await createClient()

    const studentId = formData.get('studentId') as string
    const roomId = formData.get('roomId') as string

    if (!studentId || !roomId) throw new Error("Missing student or room ID")

    const { data: studentData } = await supabase.from('students').select('move_in_date').eq('id', studentId).single();

    // Only set move_in_date if it's the first time they are being assigned
    const updateData: any = {
        room_id: roomId,
        status: 'Active' // Reset status in case they were previously 'Moved Out'
    };
    if (!studentData?.move_in_date) {
        updateData.move_in_date = new Date().toISOString();
    }

    const { error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', studentId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/rooms')
    revalidatePath('/dashboard')
}

export async function unassignStudentFromRoom(studentId: string) {
    const supabase = await createClient()

    if (!studentId) throw new Error("Missing student ID")

    const { error } = await supabase
        .from('students')
        .update({ room_id: null })
        .eq('id', studentId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/rooms')
    revalidatePath('/dashboard/students')
    revalidatePath('/dashboard')
}

export async function checkoutStudent(studentId: string) {
    const supabase = await createClient()

    if (!studentId) throw new Error("Missing student ID")

    // Additional backend validation to prevent forced bypasses
    const { data: student } = await supabase.from('students').select('room_id').eq('id', studentId).single();
    if (student?.room_id) {
        throw new Error("Student must be unassigned from their room before checkout out.");
    }

    const { error } = await supabase
        .from('students')
        .update({ status: 'Moved Out' })
        .eq('id', studentId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/students')
    revalidatePath('/dashboard')
}

export async function deleteRoom(roomId: string) {
    const supabase = await createClient()

    // Can only delete empty rooms, ensure at server level just in case
    const { count } = await supabase.from('students').select('*', { count: 'exact', head: true }).eq('room_id', roomId)
    if (count && count > 0) throw new Error("Cannot delete a room with assigned students.");

    const { error } = await supabase.from('rooms').delete().eq('id', roomId);
    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/rooms')
    revalidatePath('/dashboard')
}

export async function editRoomAction(formData: FormData) {
    const supabase = await createClient()

    const roomId = formData.get('roomId') as string
    const capacity = parseInt(formData.get('capacity') as string)
    const type = formData.get('roomType') as string

    if (!roomId || !capacity || !type) throw new Error("Missing required fields");

    const { error } = await supabase
        .from('rooms')
        .update({ capacity, type })
        .eq('id', roomId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/rooms')
    revalidatePath('/dashboard')
}

export async function deletePayment(paymentId: string) {
    const supabase = await createClient()

    if (!paymentId) throw new Error("Missing payment ID")

    const { error } = await supabase.from('payments').delete().eq('id', paymentId);
    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/students')
}

export async function editPaymentAction(formData: FormData) {
    const supabase = await createClient()

    const paymentId = formData.get('paymentId') as string
    const amount = parseFloat(formData.get('amount') as string)
    const month = formData.get('month') as string

    if (!paymentId || !amount || !month) throw new Error("Missing required fields");

    const { error } = await supabase
        .from('payments')
        .update({ amount, month })
        .eq('id', paymentId)

    if (error) throw new Error(error.message)

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/students')
}
