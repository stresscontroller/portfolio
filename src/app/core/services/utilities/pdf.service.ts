import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatDate } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PdfService {
    generateAssignmentsPdf(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        assignments: any[],
        config: {
            lastUpdated?: Date;
            dateSelected: Date;
        }
    ) {
        const doc = new jsPDF({
            orientation: 'landscape',
            format: 'letter',
            unit: 'px',
        });

        // pdf config
        const colorBlack = '#000000';
        const colorGray = '#4d4e53';
        const pdfConfig = {
            headerTextSize: 15,
            labelTextSize: 10,
            subTextSize: 8,
        };
        const padding = 15;

        // disclaimer
        doc.setTextColor(colorBlack);
        doc.setFontSize(pdfConfig.labelTextSize);
        doc.text(
            'The table below may contain filtered or outdated data. Use the Operator App to view all the latest departures.',
            padding,
            60
        );

        // table
        autoTable(doc, {
            theme: 'plain',
            margin: { top: 75, left: 15, right: 15, bottom: 15 },
            styles: { fontSize: 8 },
            headStyles: {
                fontSize: 7,
                lineColor: [241, 241, 241],
                lineWidth: { top: 0, left: 0, right: 0, bottom: 1 },
            },
            body: assignments,
            columns: [
                { header: 'TIME', dataKey: 'time' },
                { header: 'TOUR', dataKey: 'tourName' },
                { header: 'ALLOCATED TO', dataKey: 'allocation' },
                { header: 'STATUS', dataKey: 'status' },
                { header: 'TOTAL', dataKey: 'total' },
                { header: 'ACTUAL', dataKey: 'actual' },
                { header: 'MAX CAP', dataKey: 'maxCapacity' },
                { header: 'DOCK', dataKey: 'dockName' },
                { header: 'GUIDE', dataKey: 'guideName' },
                { header: 'TRANSPORTATION', dataKey: 'transportationName' },
            ],
            didParseCell: (cellHook) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const rawValue = cellHook.row.raw as any;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const column = cellHook.column.raw as any;
                const status = rawValue?.status;
                cellHook.cell.styles.lineWidth = {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0.5,
                };
                cellHook.cell.styles.lineColor = [241, 241, 241];
                if (
                    ['total', 'actual', 'maxCapacity'].indexOf(
                        column.dataKey
                    ) >= 0
                ) {
                    cellHook.cell.styles.halign = 'center';
                }
                cellHook.cell.styles.valign = 'middle';
                switch (status) {
                    case 'Closed':
                        cellHook.cell.styles.fillColor = [241, 219, 212];
                        break;
                    case 'Open':
                        cellHook.cell.styles.fillColor = [216, 232, 219];
                        break;
                    case 'Confirmed':
                        cellHook.cell.styles.fillColor = [221, 221, 221];
                        break;
                }
            },
            willDrawCell: (cellHook) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const column = cellHook.column.raw as any;
                if (column && cellHook?.cell.section === 'body') {
                    if (column.dataKey === 'tourName') {
                        doc.setFont('Helvetica', 'bold');
                    } else if (column.dataKey === 'actual') {
                        doc.setFontSize(9);
                        doc.setFont('Helvetica', 'bold');
                    } else if (column.dataKey === 'status') {
                        doc.setFont('Helvetica', 'bold');
                        doc.setFontSize(7);
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const status = (cellHook.row.raw as any)?.status;
                        switch (status) {
                            case 'Closed':
                                doc.setTextColor('#c64d4d');
                                break;
                            case 'Open':
                                doc.setTextColor('#1c8d4f');
                                break;
                        }
                    }
                }
            },
        });

        // header and footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // header
            doc.addImage(
                '/assets/images/cruisecode-logo-mini.png',
                'png',
                15,
                padding,
                30,
                30
            );

            doc.setTextColor(colorBlack);
            doc.setFontSize(pdfConfig.headerTextSize);
            doc.text(
                `Daily Tour Dispatch (${formatDate(
                    config.dateSelected,
                    'MM/dd/YYYY',
                    'en-US'
                )})`,
                padding + 30 + 8,
                padding + 17
            );
            doc.setTextColor(colorGray);
            doc.setFontSize(pdfConfig.subTextSize);
            if (config.lastUpdated) {
                doc.text(
                    `Generated on ${formatDate(
                        config.lastUpdated,
                        'MM/dd/YYYY, h:mm a',
                        'en-US'
                    )}`,
                    padding + 30 + 8,
                    padding + pdfConfig.headerTextSize + 11
                );
            }

            // footer
            doc.setFontSize(8);
            doc.setTextColor(colorGray);
            doc.text(
                'Page ' + String(i) + ' of ' + String(pageCount),
                doc.internal.pageSize.width - padding,
                doc.internal.pageSize.height - padding,
                {
                    align: 'right',
                }
            );
        }

        doc.save(
            `Daily Tour Dispatch ${formatDate(
                config.dateSelected,
                'YYYY-MM-dd',
                'en-US'
            )}`
        );
    }
}
