
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
    const adminDetails = MOCK_USER_INITIAL;
    const receiptRef = useRef();

    const handleDownload = () => {
        const input = receiptRef.current;
        if (!input) return;

        html2canvas(input, { 
            scale: 2, // Higher scale for better quality
            useCORS: true 
        }).then((canvas) => {
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
            const canvasAspectRatio = canvasWidth / canvasHeight;
            const pdfAspectRatio = pdfWidth / pdfHeight;

            let finalWidth, finalHeight;

            // Fit to width
            finalWidth = pdfWidth;
            finalHeight = finalWidth / canvasAspectRatio;
            
            // If it's too high after fitting to width, then fit to height
            if (finalHeight > pdfHeight) {
                finalHeight = pdfHeight;
                finalWidth = finalHeight * canvasAspectRatio;
            }
            
            // Center the image
            const x = (pdfWidth - finalWidth) / 2;
            const y = (pdfHeight - finalHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
            pdf.save(`rent-receipt-${payment.id}.pdf`);
        });
    };

    return (
        <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-2xl font-bold">Rent Receipt</h2>
                    <p className="text-muted-foreground">Receipt #{payment.id.slice(-6)}</p>
                </div>
            </div>

            <div className="flex justify-end max-w-lg mx-auto">
                 <Button onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </div>
            
            <div ref={receiptRef} className="p-8 bg-white max-w-lg mx-auto border rounded-lg text-black">
                <div className="space-y-4">
                    <h3 className="text-xl font-medium text-gray-800">Hi {tenant.name},</h3>
                    <p className="text-gray-600">
                        Thank you for your payment. This email serves as your receipt. The payment is for rent covering the period of {format(parseISO(payment.date), 'MMMM yyyy')}.
                    </p>
                </div>

                <div className="mt-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="p-3 bg-gray-100 border-b font-semibold text-gray-700">Invoice #</th>
                                <th className="p-3 bg-gray-100 border-b font-semibold text-gray-700">Payment Date</th>
                                <th className="p-3 bg-gray-100 border-b font-semibold text-gray-700 text-right">Amount Paid</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="p-3 border-b border-gray-200 text-gray-800">{payment.id}</td>
                                <td className="p-3 border-b border-gray-200 text-gray-800">{format(parseISO(payment.date), 'dd MMMM, yyyy')}</td>
                                <td className="p-3 border-b border-gray-200 text-gray-800 text-right">{payment.amount.toLocaleString()}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="2" className="p-3 font-semibold text-gray-800 text-right">Total:</td>
                                <td className="p-3 font-semibold text-gray-800 text-right">{payment.amount.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                 <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        If you have any questions, please contact us at {adminDetails.username}.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Issued by: {defaults.propertyName || '[Your Property Name]'}
                    </p>
                 </div>
            </div>
        </div>
    );
}
