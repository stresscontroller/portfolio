export const CreditCardExpiredMonthOptions = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
];

export const CreditCardExpiredYearOptions = getCreditCardExpiredYearOptions();

function getCreditCardExpiredYearOptions() {
    const currentYear = new Date().getFullYear();
    const expiredYears = Array.from({ length: 11 }, (_, i) => currentYear + i);
    return expiredYears;
}
