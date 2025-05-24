import * as fs from 'fs';
import * as path from 'path';

const foldersToClean = [
    'repository/cover',
    'repository/bgmpreview',
    'repository/bgm',
    'repository/background',
    'repository/level',
    'repository/chart',
    'repository/preview',
];

try {
    foldersToClean.forEach(folderPath => {
        const fullPath = path.join(process.cwd(), folderPath);

        if (fs.existsSync(fullPath)) {
            fs.readdirSync(fullPath).forEach(file => {
                const curPath = path.join(fullPath, file);
                fs.unlinkSync(curPath);
            });
            console.log(`[*]Delete ${folderPath}`);
        } else {
            console.log(`[!]Not Found ${folderPath}`);
        }
    });

    console.log('All done!');
} catch (error) {
    console.error('error', error);
    process.exit(1);
}