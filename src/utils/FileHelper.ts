export namespace FileHelper {
  /**
   * 路径信息接口
   */
  export interface PathInfo {
    dir: string; // 目录路径
    name: string; // 文件名（不含扩展名）
    ext: string; // 扩展名（包含点）
    base: string; // 完整文件名（包含扩展名）
    fullPath: string; // 原始完整路径
  }

  /**
   * 获取目录路径
   */
  export function getDirectory(filePath: string): string {
    const lastSlashIndex = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
    return lastSlashIndex >= 0 ? filePath.substring(0, lastSlashIndex) : '';
  }

  /**
   * 获取文件名（不含扩展名）
   */
  export function getFileName(filePath: string): string {
    const fullName = getFullFileName(filePath);
    const lastDotIndex = fullName.lastIndexOf('.');
    return lastDotIndex >= 0 ? fullName.substring(0, lastDotIndex) : fullName;
  }

  /**
   * 获取文件扩展名
   */
  export function getFileExtension(filePath: string): string {
    const fullName = getFullFileName(filePath);
    const lastDotIndex = fullName.lastIndexOf('.');
    return lastDotIndex >= 0 ? fullName.substring(lastDotIndex) : '';
  }

  /**
   * 获取完整文件名（包含扩展名）
   */
  export function getFullFileName(filePath: string): string {
    const lastSlashIndex = Math.max(filePath.lastIndexOf('/'), filePath.lastIndexOf('\\'));
    return lastSlashIndex >= 0 ? filePath.substring(lastSlashIndex + 1) : filePath;
  }

  /**
   * 解析文件路径，获取所有信息
   */
  export function parseFilePath(filePath: string): PathInfo {
    return {
      dir: getDirectory(filePath),
      name: getFileName(filePath),
      ext: getFileExtension(filePath),
      base: getFullFileName(filePath),
      fullPath: filePath
    };
  }

  /**
   * 连接路径（简单实现）
   */
  export function join(...paths: string[]): string {
    return paths.filter(Boolean).join('/').replace(/\/+/g, '/');
  }

  /**
   * 标准化路径（统一使用正斜杠）
   */
  export function normalize(path: string): string {
    return path.replace(/\\/g, '/');
  }
}
