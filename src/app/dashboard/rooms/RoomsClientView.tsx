"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Users, Plus, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { addRoom, assignStudentToRoom, deleteRoom, editRoomAction, unassignStudentFromRoom } from "@/app/actions/db"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RoomsClientView({ initialRooms, unassignedStudents }: { initialRooms: any[], unassignedStudents: any[] }) {
    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [assignRoomId, setAssignRoomId] = useState<string | null>(null);
    const [editRoomObj, setEditRoomObj] = useState<any>(null);
    const [confirmDeleteRoom, setConfirmDeleteRoom] = useState<string | null>(null);
    const [confirmRemoveStudent, setConfirmRemoveStudent] = useState<string | null>(null);

    const filteredRooms = useMemo(() => {
        return initialRooms.filter(r => r.id.toLowerCase().includes(searchQuery.toLowerCase()) || r.type.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [initialRooms, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Rooms Management</h1>
                    <p className="text-sm text-slate-500">Manage all rooms, beds, and assignments.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Search rooms..."
                        className="w-64 bg-white dark:bg-slate-950"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="w-4 h-4 mr-2" /> Add Room</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={(formData) => {
                                addRoom(formData);
                                setIsAddRoomOpen(false);
                            }}>
                                <DialogHeader>
                                    <DialogTitle>Create New Room</DialogTitle>
                                    <DialogDescription>Define the capacity and type of the new room.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Room Number</label>
                                            <Input name="roomNumber" placeholder="e.g. 305" required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Capacity (Beds)</label>
                                            <Input name="capacity" type="number" placeholder="2" min="1" max="10" defaultValue="2" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Room Type</label>
                                        <Input name="roomType" placeholder="e.g. Double Studio" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Assign Student (Optional)</label>
                                        <Select name="studentId">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an unassigned student" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Leave empty for now</SelectItem>
                                                {unassignedStudents.length === 0 && <SelectItem value="empty" disabled>No unassigned students available.</SelectItem>}
                                                {unassignedStudents.map(student => (
                                                    <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" type="button" onClick={() => setIsAddRoomOpen(false)}>Cancel</Button>
                                    <Button type="submit">Create Room</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRooms.map((room) => (
                    <Card key={room.id} className="relative overflow-hidden group">
                        <div className={`absolute top-0 left-0 w-1 h-full ${room.status === 'Full' ? 'bg-red-500' :
                            room.status === 'Empty' ? 'bg-green-400' : 'bg-primary-500'
                            }`} />

                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-slate-900 dark:text-white">Room {room.id}</CardTitle>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">{room.type}</p>
                            </div>
                            <Badge variant={room.status === 'Full' ? 'destructive' : room.status === 'Empty' ? 'success' : 'default'} className="ml-auto">
                                {room.status}
                            </Badge>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center text-sm py-2">
                                <span className="text-slate-500 flex items-center gap-2"><Users className="w-4 h-4" /> Occupants</span>
                                <span className="font-semibold">{room.occupants} / {room.capacity}</span>
                            </div>

                            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {Array.from({ length: room.capacity }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-8 rounded-md flex items-center justify-center border-2 ${i < room.occupants
                                            ? 'border-primary-100 bg-primary-50 text-primary-600 dark:border-primary-900/50 dark:bg-primary-900/20'
                                            : 'border-slate-100 bg-slate-50 text-slate-300 border-dashed dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-600'
                                            }`}
                                    >
                                        <Bed className="w-4 h-4" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800/50 flex justify-between">
                            <Button variant="ghost" size="sm" className="h-8 px-2 text-primary-600 dark:text-primary-400" onClick={() => setSelectedRoom(room)}>
                                View Details
                            </Button>
                            <div className="flex">
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-slate-900 dark:hover:text-white" onClick={() => setEditRoomObj(room)}>
                                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="h-8 px-2 disabled:opacity-30"
                                    disabled={room.occupants > 0}
                                    onClick={() => setConfirmDeleteRoom(room.id)}
                                >
                                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Room Details Dialog */}
            <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Room Details - {selectedRoom?.id}</DialogTitle>
                        <DialogDescription>
                            {selectedRoom?.type} • Capacity: {selectedRoom?.capacity} Beds
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Current Occupants ({selectedRoom?.occupants})</h4>
                        {selectedRoom?.students.length > 0 ? (
                            <ul className="space-y-3">
                                {selectedRoom.students.map((student: any, idx: number) => (
                                    <li key={idx} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
                                        <span className={`font-medium ${student.paymentStatus === 'Late' ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                                            {student.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={student.paymentStatus === 'Late' ? 'destructive' : 'success'}>
                                                {student.paymentStatus}
                                            </Badge>
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={() => {
                                                    setConfirmRemoveStudent(student.id);
                                                    setSelectedRoom(null);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                This room is currently empty.
                            </p>
                        )}

                        {selectedRoom?.occupants < selectedRoom?.capacity && (
                            <Button className="w-full mt-4" variant="outline" onClick={() => { setAssignRoomId(selectedRoom.id); setSelectedRoom(null); }}>
                                <Plus className="w-4 h-4 mr-2" /> Assign Student to Empty Bed
                            </Button>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setSelectedRoom(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!assignRoomId} onOpenChange={(open) => !open && setAssignRoomId(null)}>
                <DialogContent>
                    <form action={(formData) => {
                        assignStudentToRoom(formData);
                        setAssignRoomId(null);
                    }}>
                        <DialogHeader>
                            <DialogTitle>Assign Student to Room</DialogTitle>
                            <DialogDescription>Select an unassigned student to move into this room.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <input type="hidden" name="roomId" value={assignRoomId || ''} />
                            <Select name="studentId" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a student" />
                                </SelectTrigger>
                                <SelectContent>
                                    {unassignedStudents.length === 0 && <SelectItem value="empty" disabled>No unassigned students available.</SelectItem>}
                                    {unassignedStudents.map(student => (
                                        <SelectItem key={student.id} value={student.id}>{student.name} ({student.id})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setAssignRoomId(null)}>Cancel</Button>
                            <Button type="submit" disabled={unassignedStudents.length === 0}>Assign Student</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editRoomObj} onOpenChange={(open) => !open && setEditRoomObj(null)}>
                <DialogContent>
                    <form action={(formData) => {
                        editRoomAction(formData);
                        setEditRoomObj(null);
                    }}>
                        <DialogHeader>
                            <DialogTitle>Edit Room Details - {editRoomObj?.id}</DialogTitle>
                            <DialogDescription>Update the capacity or type of this room.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <input type="hidden" name="roomId" value={editRoomObj?.id || ''} />
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Capacity (Beds)</label>
                                <Input name="capacity" type="number" min={editRoomObj?.occupants || 1} max="10" defaultValue={editRoomObj?.capacity} required />
                                <p className="text-xs text-slate-500">Cannot be less than the {editRoomObj?.occupants} current occupants.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Room Type</label>
                                <Input name="roomType" defaultValue={editRoomObj?.type || ''} required />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" type="button" onClick={() => setEditRoomObj(null)}>Cancel</Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Room Dialog */}
            <Dialog open={!!confirmDeleteRoom} onOpenChange={(open) => !open && setConfirmDeleteRoom(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete the room. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmDeleteRoom(null)}>Cancel</Button>
                        <Button variant="danger" onClick={() => {
                            if (confirmDeleteRoom) deleteRoom(confirmDeleteRoom);
                            setConfirmDeleteRoom(null);
                        }}>Yes, delete room</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Remove Student Dialog */}
            <Dialog open={!!confirmRemoveStudent} onOpenChange={(open) => !open && setConfirmRemoveStudent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Student from Room?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to unassign this student from their current room? They will be available to assign to a new room afterwards.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmRemoveStudent(null)}>Cancel</Button>
                        <Button variant="danger" onClick={async () => {
                            if (confirmRemoveStudent) {
                                await unassignStudentFromRoom(confirmRemoveStudent);
                                setConfirmRemoveStudent(null);
                            }
                        }}>Yes, remove student</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
