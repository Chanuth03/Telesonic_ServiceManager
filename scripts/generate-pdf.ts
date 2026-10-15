import fs from "fs";
import path from "path";
import { generateTelesonicGuidePdf } from "../src/utils/generateGuidePdf.js";

async function main() {
  console.log("Generating Telesonic 3 Tiles Step-by-Step Guide PDF...");
  const doc = generateTelesonicGuidePdf();

  // Output as arraybuffer / Buffer
  const arrayBuffer = doc.output("arraybuffer");
  const buffer = Buffer.from(arrayBuffer);

  const publicDir = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, "Telesonic_3_Tiles_Step_By_Step_Guide.pdf");
  fs.writeFileSync(outputPath, buffer);
  console.log(`PDF successfully saved to: ${outputPath} (${buffer.length} bytes)`);
}

main().catch((err) => {
  console.error("Error generating PDF:", err);
  process.exit(1);
});
