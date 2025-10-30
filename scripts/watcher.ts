import chokidar from "chokidar";
import path from "path";
import { exec } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(process.cwd(), "data");

const watcher = chokidar.watch(DATA_DIR, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: true,
});

console.log("PDF Watcher 실행 중... (data 폴더 감시)");

watcher.on("add", (filePath) => {
  if (filePath.endsWith(".pdf")) {
    console.log(`새 PDF 감지: ${filePath}`);
    exec(
      `node --loader ts-node/esm ./ingest-pdf.ts "${filePath}"`,
      { cwd: __dirname },
      (err, stdout, stderr) => {
      if (err) {
        console.error("인게스트 오류:", err);
      } else {
        console.log(stdout);
      }
      }
    );
  }
});
