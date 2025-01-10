const { exec } = require('child_process');

function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error executing command: ${command}\n${error}`);
            } else {
                resolve(stdout);
            }
        });
    });
}

async function manageProcess() {
    try {
        // Lấy danh sách các tiến trình PM2
        const listOutput = await runCommand('pm2 list');
        console.log(listOutput);

        // Kiểm tra xem có tiến trình tên 'abcd' trong danh sách hay không
        const isAbcdPresent = listOutput.includes('abcd');

        if (isAbcdPresent) {
            console.log("Process 'abcd' found. Restarting...");
            // Khởi động lại tiến trình 'abcd'
            await runCommand('pm2 restart abcd');
            console.log("Process 'abcd' restarted successfully.");
        } else {
            console.log("Process 'abcd' not found. Starting new process...");
            // Khởi động tiến trình mới với tên 'abcd'
            await runCommand('pm2 start index.js --name abcd');
            console.log("Process 'abcd' started successfully.");
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

manageProcess();
