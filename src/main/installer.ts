import axios from "axios";
import {createReadStream, createWriteStream} from "fs";
import {Readable} from "stream";
import hasha from "hasha";
import {promises} from "fs";
import {join} from "path";
import decompress from "decompress";

const {stat, rm} = promises;

export default class Installer {
    public static download(url: string, to: string, percentageCallback?: (percentage: number) => void): Promise<void> {
        return new Promise(async (ff, rj) => {
            console.log(`[Installer] Opening ${to} for writing.`);
            const writeStream = createWriteStream(to);

            console.log(`[Installer] Requesting ${url}...`);
            const response = await axios.get<Readable>(url, {
                method: "GET",
                responseType: "stream"
            });

            const totalSize = response.headers['content-length'];
            console.log(`[Installer] Download started. Expecting ${totalSize} bytes`);

            let downloaded = 0;
            response.data.on("data", (chunk: Buffer) => {
                downloaded += chunk.length;

                if(percentageCallback)
                    percentageCallback(downloaded / totalSize);
            });

            response.data.on("end", () => {
                console.log(`[Installer] Download finished. Received ${downloaded} bytes`);
                writeStream.end();
                ff();
            })

            response.data.pipe(writeStream);
        });
    }

    public static async downloadString(url: string): Promise<string> {
        console.log(`[Installer] Requesting ${url}...`);
        const response = await axios.get<string>(url, {
            method: "GET",
            responseType: "text"
        });

        return response.data;
    }

    public static async validateSha512(localPath: string, sha512: string): Promise<boolean> {
        const actualHash = hasha.fromFileSync(localPath, {algorithm: "sha512"}).toUpperCase();

        console.log(`[Installer] Calculated SHA512 of ${localPath}. Expecting ${sha512}, got ${actualHash}`);

        return actualHash == sha512;
    }

    public static async installZip(gamePath: string, zipPath: string) {
        if(await Installer.exists(join(gamePath, "MelonLoader")))
            await Installer.uninstall(gamePath);

        console.log(`[Installer] Unpacking ${zipPath} to ${gamePath}`);

        await decompress(zipPath, gamePath);

        console.log("[Installer] Unzipping complete.");
    }

    public static async uninstall(gamePath: string) {
        console.log(`[Installer] Uninstalling from ${gamePath}`);
        await rm(join(gamePath, "MelonLoader"), {recursive: true, force: true});
        await rm(join(gamePath, "version.dll"), {force: true});
    }

    public static async exists(path: string): Promise<boolean> {
        try {
            const ret = await stat(path);
            return true;
        } catch(e) {
            return false;
        }
    }
}