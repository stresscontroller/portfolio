export const InputMasks = {
    cardNumber: {
        mask: '9999 9999 9999 9999',
        // 9999999999999999 => 9999 9999 9999 9999
        toForm: (str: string) => str.replace(/\s/g, ''),
        // 9999 9999 9999 9999 => 9999999999999999
        fromForm: (str: string) => str.replace(/\s/g, ''),
    },
    phoneNumber: {
        mask: '9(999) 999-9999',
        // 1234567890 => 1(234) 567-890
        toForm: (str: string) => {
            const digits = str.split('');
            const firstDigit = digits.shift(); // Remove and store the first digit
            return `${firstDigit}(${digits[0]}${digits[1]}${digits[2]}) ${digits[3]}${digits[4]}${digits[5]}-${digits[6]}${digits[7]}${digits[8]}${digits[9]}`;
        },
        //removes all non digit characters
        // 1(234) 567-890 => 1234567890
        fromForm: (str: string) => str.replace(/\D/g, ''),
    },
};

// to = service response TO the input
// from = FROM input to service
