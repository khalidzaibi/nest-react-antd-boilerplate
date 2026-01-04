import * as fs from 'fs';
import * as path from 'path';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileStorageService {
    ensureDir(dir: string) {
        fs.mkdirSync(dir, { recursive: true });
    }

    saveBuffer(dir: string, originalName: string, buffer: Buffer) {
        const filename = `${Date.now()}-${originalName}`;
        const fullPath = path.join(dir, filename);
        fs.writeFileSync(fullPath, buffer);
        return { filename, fullPath };
    }
}
