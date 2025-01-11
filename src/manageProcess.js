// Dùng để quản lý tiến trình worker pm2, restart nếu đang chạy, và start nếu chưa chạy hoặc chưa có trong pm2

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
        const isWorkerPresent = listOutput.includes('worker');

        if (isWorkerPresent) {
            console.log("Process 'worker' found. Restarting...");
            // Khởi động lại tiến trình 'worker'
            await runCommand('pm2 restart worker');
            console.log("Process 'worker' restarted successfully.");
        } else {
            console.log("Process 'worker' not found. Starting new process...");
            // Khởi động tiến trình mới với tên 'worker'
            await runCommand('pm2 start src/worker.js --name worker');
            console.log("Process 'worker' started successfully.");
        }
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

manageProcess();
