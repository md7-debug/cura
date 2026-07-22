export async function availableFilename(filename, exists) {
  const extensionIndex = filename.lastIndexOf(".");
  const stem = extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename;
  const extension = extensionIndex > 0 ? filename.slice(extensionIndex) : "";

  for (let copy = 1; copy <= 100; copy += 1) {
    const candidate = copy === 1 ? filename : `${stem} (${copy})${extension}`;
    if (!(await exists(candidate))) return candidate;
  }

  throw new Error("No available filename");
}
