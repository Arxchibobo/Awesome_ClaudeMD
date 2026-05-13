import { expect } from 'chai';
import { ProtocolParser, PROTOCOL_MARKERS } from '../../claudemd/protocol';

describe('ProtocolParser', () => {
  const sampleProtocol = `
<!-- ASINIT START -->
# Protocol
## One
<!-- CONSTRAINTS START -->
Old constraints
<!-- CONSTRAINTS END -->
<!-- ASINIT END -->

## Custom Content
Hello world.
`;

  describe('parse', () => {
    it('should correctly parse protocol sections', () => {
      const parsed = ProtocolParser.parse(sampleProtocol);
      expect(parsed.asinitSection).to.contain('# Protocol');
      expect(parsed.constraintsSection).to.contain('Old constraints');
      expect(parsed.customContent).to.equal('## Custom Content\nHello world.');
    });

    it('should handle missing markers', () => {
      const content = 'no markers here';
      const parsed = ProtocolParser.parse(content);
      expect(parsed.asinitSection).to.be.undefined;
      expect(parsed.customContent).to.equal(content);
    });
  });

  describe('merge', () => {
    it('should replace asinit section and keep custom content', () => {
      const newAsinit = `<!-- ASINIT START -->
# New Protocol
<!-- ASINIT END -->`;
      const result = ProtocolParser.merge(sampleProtocol, newAsinit);
      expect(result).to.contain('# New Protocol');
      expect(result).to.not.contain('# Protocol');
      expect(result).to.contain('## Custom Content');
    });

    it('should prepend asinit section if not present', () => {
      const content = '## My Project';
      const newAsinit = '<!-- ASINIT START -->\n# New Protocol\n<!-- ASINIT END -->';
      const result = ProtocolParser.merge(content, newAsinit);
      expect(result.startsWith(newAsinit)).to.be.true;
      expect(result).to.contain('## My Project');
    });
  });

  describe('updateConstraints', () => {
    it('should update constraints section', () => {
      const newConstraints = 'New logic here';
      const result = ProtocolParser.updateConstraints(sampleProtocol, newConstraints);
      expect(result).to.contain('New logic here');
      expect(result).to.not.contain('Old constraints');
      expect(result).to.contain(PROTOCOL_MARKERS.CONSTRAINTS_START);
      expect(result).to.contain(PROTOCOL_MARKERS.CONSTRAINTS_END);
    });
  });

  describe('validate', () => {
    it('should validate complete protocol', () => {
      const result = ProtocolParser.validate(sampleProtocol);
      expect(result.valid).to.be.true;
    });

    it('should invalidate if markers are missing', () => {
      const result = ProtocolParser.validate('# No markers');
      expect(result.valid).to.be.false;
      expect(result.errors).to.have.lengthOf(2);
    });

    it('should invalidate if order is wrong', () => {
      const content = `${PROTOCOL_MARKERS.END}\n${PROTOCOL_MARKERS.START}`;
      const result = ProtocolParser.validate(content);
      expect(result.valid).to.be.false;
      expect(result.errors).to.contain('ASINIT 标记顺序错误');
    });
  });
});
