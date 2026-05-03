
// --- Date Helper Functions ---
export const toISODateString = (date: Date): string => date.toISOString().split('T')[0];

export const isSameDay = (d1: Date, d2: Date): boolean => toISODateString(d1) === toISODateString(d2);

export const getWeekDays = (date: Date, numDays: number = 7): Date[] => {
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay(); // Sunday - 0, Monday - 1, etc.
    // To ensure a consistent week view, we can start from the Sunday of the week `date` is in.
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    
    // For this app's horizontal scroll, let's center the initial date by starting a few days back.
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - Math.floor(numDays / 2));

    return Array.from({ length: 30 }, (_, i) => { // Render a larger block of days for smooth scrolling
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() - 15 + i); // Center around the current week
        return day;
    });
};

export const getCalendarDays = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from the Sunday of the first week

    const endDate = new Date(lastDayOfMonth);
    if (endDate.getDay() !== 6) { // If the last day isn't a Saturday
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }
    
    const days: Date[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
    }
    return days;
};
