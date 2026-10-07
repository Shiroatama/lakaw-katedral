import QRCode from "qrcode";

/** High error correction SVG for print (SPEC §14: level Q or H). */
export async function makeQrSvg(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#2a211c",
      light: "#ffffff",
    },
  });
}
