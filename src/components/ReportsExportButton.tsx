"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ReportsExportButton() {
    const handleExport = () => {
        window.print();
    }

    return (
        <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
    )
}
