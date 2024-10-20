const fs = require('fs');
const axios = require('axios');

const apiKey = 'BFjRfjiKmre8iApb8Te1yiAmHosJpmUO';
const country = 'IN';
const year = 2024;
const apiUrl = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${country}&year=${year}`;

const fetchHolidays = async () => {
    try {
        const response = await axios.get(apiUrl);
        const holidays = response.data.response.holidays;

        const newHolidays = holidays.map(holiday => {
            const dateParts = holiday.date.iso.split('T')[0].split('-'); // Split YYYY-MM-DD
            const utcDate = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2])); // Create a UTC date
            return {
                name: holiday.name,
                date: utcDate.toISOString(), // Store as ISO string for consistency
                type: holiday.type 
            };
        });

        fs.readFile('Holidays.json', 'utf8', (err, data) => {
            let existingHolidays = [];

            if (!err && data) {
                existingHolidays = JSON.parse(data);
            }

            const updatedHolidays = [...existingHolidays, ...newHolidays];

            fs.writeFile('Holidays.json', JSON.stringify(updatedHolidays, null, 2), (err) => {
                if (err) throw err;
                console.log(`Holidays for ${year} have been appended to Holidays.json!`);
            });
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
};
fetchHolidays();


function getAllDatesWithWeekdays() {
    const startYear = 2024;
    const endYear = 2025;
    const allDates = {};

    for (let year = startYear; year <= endYear; year++) {
        for (let month = 0; month < 12; month++) { // 0-11 for January-December
            const daysInMonth = new Date(year, month + 1, 0).getUTCDate(); // Get the number of days in the month

            for (let day = 1; day <= daysInMonth; day++) {
                // Create a date using UTC methods
                const date = new Date(Date.UTC(year, month, day));
                const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
                
                // Get the full weekday name
                const weekday = date.toLocaleString('en-US', { weekday: 'long' });

                // Check if it's a Sunday
                const isHoliday = weekday === 'Sunday';

                // Store the date, weekday, and holiday status
                allDates[dateString] = {
                    weekday: weekday,
                    isHoliday: isHoliday
                };

                // Debugging output to confirm date and weekday
                console.log(`${dateString}: ${weekday}, Holiday: ${isHoliday}`);
            }
        }
    }

    // Write the results to a file
    fs.writeFileSync('AllDates.json', JSON.stringify(allDates, null, 2));
    console.log('All dates with weekdays and holiday status have been written to AllDates.json');
}

// Call the function
// getAllDatesWithWeekdays();

