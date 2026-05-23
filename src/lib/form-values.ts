export function optionalFormText(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  return value ? value : null;
}
