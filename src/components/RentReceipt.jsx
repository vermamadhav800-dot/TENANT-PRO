
"use client";

import { Printer, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';

export default function RentReceipt({ receiptDetails, onBack }) {
    const { payment, tenant, room } = receiptDetails;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={onBack}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold">Rent Receipt</h2>
            </div>
            
            <Card className="max-w-2xl mx-auto printable-area">
                <CardHeader className="bg-muted/50 p-6 border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">Rent Receipt</CardTitle>
                            <CardDescription>Receipt #{payment.id.slice(-6)}</CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">EstateFlow Property Mgmt.</p>
                            <p className="text-sm text-muted-foreground">your-property-address@example.com</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-2">Paid By</h4>
                            <p>{tenant.name}</p>
                            <p>{tenant.username}</p>
                            <p>Room: {tenant.unitNo}</p>
                        </div>
                        <div className="text-right">
                             <h4 className="font-semibold mb-2">Payment Details</h4>
                            <p>Date: {format(parseISO(payment.date), 'dd MMMM, yyyy')}</p>
                            <p>Method: {payment.method}</p>
                        </div>
                    </div>

                    <div className="border-t border-b py-4 my-4">
                        <div className="flex justify-between items-center">
                            <p className="text-muted-foreground">Rent for {format(parseISO(payment.date), 'MMMM yyyy')}</p>
                            <p className="font-semibold">{payment.amount.toLocaleString()}</p>
                        </div>
                    </div>

                     <div className="flex justify-between items-center text-xl font-bold">
                        <p>Total Paid</p>
                        <p>{payment.amount.toLocaleString()}</p>
                    </div>

                </CardContent>
                <CardFooter className="bg-muted/50 p-6 border-t text-center text-xs text-muted-foreground">
                    This is a computer-generated receipt and does not require a signature.
                </CardFooter>
            </Card>

            <div className="flex justify-end max-w-2xl mx-auto">
                 <Button onClick={handlePrint} className="no-print">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Receipt
                </Button>
            </div>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .printable-area, .printable-area * {
                        visibility: visible;
                    }
                    .printable-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        border: none;
                        box-shadow: none;
                    }
                    .no-print {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}
