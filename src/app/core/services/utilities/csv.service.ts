import { Injectable } from '@angular/core';
import { utils, writeFile } from 'xlsx';

export interface CsvConfig {
    filterData: { fieldName: string; fieldValue: string | number }[];
    mainData: Record<string, string | number>[];
    spaceBetweenFilterAndDate?: number;
    filename: string;
    fileExtension: string;
}

@Injectable({
    providedIn: 'root',
})
export class CsvService {
    exportToCsv(config: CsvConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const worksheet = utils.aoa_to_sheet(
                    config.filterData.reduce<(string | number)[][]>(
                        (acc, curr) => {
                            acc.push([curr.fieldName, curr.fieldValue || '']);
                            return acc;
                        },
                        []
                    )
                );

                // add spacing
                const spaceBetweenFilterAndDate =
                    config.spaceBetweenFilterAndDate ?? 2;
                if (spaceBetweenFilterAndDate > 0) {
                    for (let i = 0; i < spaceBetweenFilterAndDate; i++) {
                        utils.sheet_add_aoa(worksheet, [[]], { origin: -1 });
                    }
                }

                utils.sheet_add_json(worksheet, config.mainData, {
                    origin: -1,
                });
                const workbook = {
                    Sheets: { data: worksheet },
                    SheetNames: ['data'],
                };

                writeFile(
                    workbook,
                    `${config.filename}.${config.fileExtension}`
                );
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }
}
