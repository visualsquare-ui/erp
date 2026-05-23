const PDF_MIME_TYPE = "application/pdf";
const JPEG_MIME_TYPE = "image/jpeg";

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

export function getVendorBillUploadContentType(file: File) {
  const extension = getExtension(file.name);

  if (file.type === PDF_MIME_TYPE || extension === "pdf") {
    return PDF_MIME_TYPE;
  }

  if (
    file.type === JPEG_MIME_TYPE ||
    file.type === "image/jpg" ||
    extension === "jpg" ||
    extension === "jpeg"
  ) {
    return JPEG_MIME_TYPE;
  }

  return null;
}

export function isAllowedVendorBillFile(file: File) {
  return Boolean(getVendorBillUploadContentType(file));
}
