export function objectToBase64<T>(params: T): string {
    return window.btoa(JSON.stringify(params));
}
export function base64ToObject<T>(params: string): T {
    return JSON.parse(window.atob(params));
}

export async function compressImage(
    file: File,
    config: { quality: number; type: string }
): Promise<File> {
    return new Promise((resolve, reject) => {
        try {
            createImageBitmap(file).then((imageBitmap) => {
                const canvas = document.createElement('canvas');
                canvas.width = imageBitmap.width;
                canvas.height = imageBitmap.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(imageBitmap, 0, 0);
                }

                // turn into Blob
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            // turn Blob into File
                            return resolve(
                                new File([blob], file.name, {
                                    type: blob.type,
                                })
                            );
                        }
                        return reject('error compressing image');
                    },
                    config.type,
                    config.quality
                );
            });
        } catch (err) {
            reject(err);
        }
    });
}
