
"use client";

import { useRef } from 'react';
import { Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export default function RentReceipt({ receiptDetails, onBack, appState }) {
    const { payment, tenant } = receiptDetails;
    const { defaults = {}, MOCK_USER_INITIAL = {} } = appState;
    const ownerDetails = MOCK_USER_INITIAL;
    const receiptRef = useRef();

    const handleDownload = () => {
        const input = receiptRef.current;
        if (!input) return;

        // Give the receipt a white background for the PDF
        const originalColor = input.style.backgroundColor;
        input.style.backgroundColor = 'white';

        html2canvas(input, { 
            scale: 2, // Higher scale for better quality
            useCORS: true 
        }).then((canvas) => {
            input.style.backgroundColor = originalColor; // Revert background color

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4' // Standard A4 size
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            
            // Maintain aspect ratio
            const ratio = canvasWidth / canvasHeight;
            let finalWidth = pdfWidth - 40; // with some margin
            let finalHeight = finalWidth / ratio;
            
            if (finalHeight > pdfHeight - 40) {
                finalHeight = pdfHeight - 40;
                finalWidth = finalHeight * ratio;
            }
            
            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
            pdf.save(`rent-receipt-${payment.id.slice(-6)}.pdf`);
        });
    };

    return (
        <div className="space-y-4 animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold font-headline">Rent Receipt</h2>
                        <p className="text-muted-foreground">Receipt #{payment.id.slice(-6)}</p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>
            
            <div ref={receiptRef} className="p-8 bg-background max-w-2xl mx-auto border rounded-lg text-foreground">
                 <div className="border-b pb-4 mb-4 flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">{defaults.propertyName || 'Property Name'}</h1>
                        <p className="text-muted-foreground">{defaults.propertyAddress || 'Property Address'}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-semibold text-primary">Rent Receipt</h2>
                        <p className="text-sm"><strong>Receipt No:</strong> {payment.id.slice(-6)}</p>
                        <p className="text-sm"><strong>Date:</strong> {format(parseISO(payment.date), 'dd MMM, yyyy')}</p>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <h3 className="font-semibold text-muted-foreground mb-1">Received From</h3>
                        <p className="font-bold">{tenant.name}</p>
                        <p>{tenant.username}</p>
                        <p>{tenant.phone}</p>
                    </div>
                     <div className="text-right">
                        <h3 className="font-semibold text-muted-foreground mb-1">Received By</h3>
                        <p className="font-bold">{ownerDetails.name}</p>
                        <p>{ownerDetails.username}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted">
                                <th className="p-3 font-semibold">Description</th>
                                <th className="p-3 font-semibold text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-3">Rent for the period of {format(parseISO(payment.date), 'MMMM yyyy')}</td>
                                <td className="p-3 text-right">₹{payment.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr className="font-bold">
                                <td className="p-3 text-right">Total Amount Paid:</td>
                                <td className="p-3 text-right text-lg">₹{payment.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                 <div className="mt-8 text-center text-xs text-muted-foreground">
                    <p>This is a computer-generated receipt and does not require a signature.</p>
                    <p>Payment was made via {payment.method}.</p>
                 </div>
            </div>
        </div>
    );
}
