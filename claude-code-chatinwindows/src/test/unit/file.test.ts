import { expect } from 'chai';
import * as path from 'path';
import { FileUtils } from '../../utils/file';

describe('FileUtils', () => {
  describe('validatePath', () => {
    const basePath = path.resolve('/tmp/base');

    it('should allow valid relative paths', () => {
      const target = 'file.txt';
      const result = FileUtils.validatePath(basePath, target);
      expect(result).to.equal(path.join(basePath, 'file.txt'));
    });

    it('should allow valid subdirectories', () => {
      const target = 'sub/file.txt';
      const result = FileUtils.validatePath(basePath, target);
      expect(result).to.equal(path.join(basePath, 'sub/file.txt'));
    });

    it('should prevent path traversal with ..', () => {
      const target = '../../etc/passwd';
      // validatePath currently removes leading .. then resolves
      // normalized becomes etc/passwd
      const result = FileUtils.validatePath(basePath, target);
      expect(result).to.equal(path.join(basePath, 'etc/passwd'));
    });

    it('should throw error if it still escapes basePath', () => {
      // If we don't have the leading .. check, or if someone finds another way
      // path.resolve('/tmp/base', '/etc/passwd') -> '/etc/passwd'
      expect(() => {
        FileUtils.validatePath(basePath, '/etc/passwd');
      }).to.throw(/安全错误/);
    });
  });
});
