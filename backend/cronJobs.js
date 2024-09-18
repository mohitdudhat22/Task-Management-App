const cron = require('node-cron');


function cronJobs(){
    cron.schedule('*/5 * * * * *', () => {
        console.log("It's cron job running every 5 seconds");
    });
}

module.exports = cronJobs;


