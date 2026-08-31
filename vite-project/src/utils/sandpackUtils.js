/**
 * Scans source files to detect npm dependencies from import statements.
 * Excludes react, react-dom, and local file imports.
 * @param {Object} files - Object mapping file paths to their content
 * @returns {Object} Object mapping package names to version strings (set to 'latest')
 */
export function detectDependencies(files) {
    const deps = {};
    if (!files) return deps;

    const allCode = Object.values(files).join("\n");
    const filePaths = Object.keys(files);

    /**
     * Checks if a package name refers to a local file or folder.
     * @param {string} pkgName - The package name to check
     * @returns {boolean} True if the package is a local file/folder
     */
    const isLocalFileOrFolder = (pkgName) => {
        const name = pkgName.startsWith("@/") ? pkgName.substring(2) : pkgName;
        return (
            pkgName.startsWith("@/") ||
            pkgName === "@" ||
            filePaths.some(p =>
                p === `/${name}` ||
                p.startsWith(`/${name}/`) ||
                p.replace(/\.[^/.]+$/, "") === `/${name}`
            )
        );
    };

    const importRegex = /from\s+['"]([^./][^'"]*)['"]/g;
    let match;
    while ((match = importRegex.exec(allCode)) !== null) {
        const rawImport = match[1];

        // Scoped packages like @scope/package, normal packages like package
        const pkg = rawImport.startsWith("@") && !rawImport.startsWith("@/")
            ? rawImport.split("/").slice(0, 2).join("/")
            : rawImport.split("/")[0];

        // Skip react (included in template), react-dom, and local modules
        if (pkg !== "react" && pkg !== "react-dom" && !isLocalFileOrFolder(pkg)) {
            deps[pkg] = "latest";
        }
    }
    return deps;
}
